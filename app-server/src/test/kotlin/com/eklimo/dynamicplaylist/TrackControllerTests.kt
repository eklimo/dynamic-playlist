package com.eklimo.dynamicplaylist

import arrow.core.left
import arrow.core.right
import com.eklimo.dynamicplaylist.tag.TrackController
import com.eklimo.dynamicplaylist.tag.TrackService
import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.mockk.every
import org.junit.jupiter.api.Assertions.assertInstanceOf
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.web.bind.MethodArgumentNotValidException

@WebMvcTest(controllers = [TrackController::class])
class TrackControllerTests {

  private companion object {
    const val FAKE_TRACK_ID = "track"

    const val ENDPOINT = "/api/v1/tracks/$FAKE_TRACK_ID"

    const val FAKE_TAG_ID = 123L
    const val FAKE_USER_ID = "user"
  }

  @Autowired private lateinit var mockMvc: MockMvc
  @Autowired private lateinit var mapper: ObjectMapper

  @MockkBean private lateinit var trackService: TrackService

  @Test
  fun `get the tags of a track`() {
    val expected = TrackService.TagsForTrackResponse(listOf(FAKE_TAG_ID))

    every { trackService.getTagsForTrack(FAKE_USER_ID, FAKE_TRACK_ID) } returns expected

    mockMvc
      .get(ENDPOINT) {
        accept = MediaType.APPLICATION_JSON
        param("user", FAKE_USER_ID)
      }
      .andExpect {
        status { isOk() }
        content { string(mapper.writeValueAsString(expected)) }
      }
  }

  @Test
  fun `get the tags of a track that doesn't exist`() {
    val expected = TrackService.TagsForTrackResponse(emptyList())

    every { trackService.getTagsForTrack(FAKE_USER_ID, FAKE_TRACK_ID) } returns expected

    mockMvc
      .get(ENDPOINT) {
        accept = MediaType.APPLICATION_JSON
        param("user", FAKE_USER_ID)
      }
      .andExpect {
        status { isOk() }
        content { string(mapper.writeValueAsString(expected)) }
      }
  }

  @Test
  fun `add a tag to a track`() {
    val requestBody = TrackController.AddTagRequest(FAKE_TAG_ID)

    val expected = Unit

    every { trackService.addTagToTrack(FAKE_TRACK_ID, FAKE_TAG_ID) } returns expected.right()

    mockMvc
      .post(ENDPOINT) {
        contentType = MediaType.APPLICATION_JSON
        content = mapper.writeValueAsString(requestBody)
      }
      .andExpect { status { isOk() } }
  }

  @Test
  fun `add a tag that doesn't exist to a track`() {
    val requestBody = TrackController.AddTagRequest(FAKE_TAG_ID)

    val expected = TrackService.Error.NotFound(FAKE_TAG_ID)

    every { trackService.addTagToTrack(FAKE_TRACK_ID, FAKE_TAG_ID) } returns expected.left()

    mockMvc
      .post(ENDPOINT) {
        contentType = MediaType.APPLICATION_JSON
        content = mapper.writeValueAsString(requestBody)
      }
      .andExpect { status { isNotFound() } }
  }

  @Test
  fun `add a tag to a track that already has it`() {
    val requestBody = TrackController.AddTagRequest(FAKE_TAG_ID)

    val expected = TrackService.Error.TrackHasTag(FAKE_TRACK_ID, FAKE_TAG_ID)

    every { trackService.addTagToTrack(FAKE_TRACK_ID, FAKE_TAG_ID) } returns expected.left()

    mockMvc
      .post(ENDPOINT) {
        contentType = MediaType.APPLICATION_JSON
        content = mapper.writeValueAsString(requestBody)
      }
      .andExpect { status { isConflict() } }
  }

  @Test
  fun `add a tag to a track using a malformed request - missing fields`() {
    val requestBody =
      """
        {
        }
      """
        .trimIndent()

    val result =
      mockMvc
        .post(ENDPOINT) {
          contentType = MediaType.APPLICATION_JSON
          content = requestBody
        }
        .andExpect { status { isBadRequest() } }
        .andReturn()

    assertInstanceOf(MethodArgumentNotValidException::class.java, result.resolvedException)
  }

  @Test
  fun `add a tag to a track using a malformed request - validation error`() {
    val tagID = 0L
    val requestBody = TrackController.AddTagRequest(tagID)

    val result =
      mockMvc
        .post(ENDPOINT) {
          contentType = MediaType.APPLICATION_JSON
          content = mapper.writeValueAsString(requestBody)
        }
        .andExpect { status { isBadRequest() } }
        .andReturn()

    assertInstanceOf(MethodArgumentNotValidException::class.java, result.resolvedException)
  }

  @Test
  fun `remove a tag from a track`() {
    val requestBody = TrackController.RemoveTagRequest(FAKE_TAG_ID)

    val expected = Unit

    every { trackService.removeTagFromTrack(FAKE_TRACK_ID, FAKE_TAG_ID) } returns expected.right()

    mockMvc
      .delete(ENDPOINT) {
        contentType = MediaType.APPLICATION_JSON
        content = mapper.writeValueAsString(requestBody)
      }
      .andExpect { status { isOk() } }
  }

  @Test
  fun `remove a tag that doesn't exist from a track`() {
    val requestBody = TrackController.RemoveTagRequest(FAKE_TAG_ID)

    val expected = TrackService.Error.NotFound(FAKE_TAG_ID)

    every { trackService.removeTagFromTrack(FAKE_TRACK_ID, FAKE_TAG_ID) } returns expected.left()

    mockMvc
      .delete(ENDPOINT) {
        contentType = MediaType.APPLICATION_JSON
        content = mapper.writeValueAsString(requestBody)
      }
      .andExpect { status { isNotFound() } }
  }

  @Test
  fun `remove a tag from a track that doesn't have it`() {
    val requestBody = TrackController.RemoveTagRequest(FAKE_TAG_ID)

    val expected = TrackService.Error.TrackHasNoTag(FAKE_TRACK_ID, FAKE_TAG_ID)

    every { trackService.removeTagFromTrack(FAKE_TRACK_ID, FAKE_TAG_ID) } returns expected.left()

    mockMvc
      .delete(ENDPOINT) {
        contentType = MediaType.APPLICATION_JSON
        content = mapper.writeValueAsString(requestBody)
      }
      .andExpect { status { isNotFound() } }
  }

  @Test
  fun `remove a tag from a track using a malformed request`() {
    val requestBody =
      """
        {
        }
      """
        .trimIndent()

    val result =
      mockMvc
        .delete(ENDPOINT) {
          contentType = MediaType.APPLICATION_JSON
          content = requestBody
        }
        .andExpect { status { isBadRequest() } }
        .andReturn()

    assertInstanceOf(MethodArgumentNotValidException::class.java, result.resolvedException)
  }
}
