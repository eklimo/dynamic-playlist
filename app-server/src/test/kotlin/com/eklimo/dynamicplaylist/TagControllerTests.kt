package com.eklimo.dynamicplaylist

import arrow.core.left
import arrow.core.right
import com.eklimo.dynamicplaylist.tag.Tag
import com.eklimo.dynamicplaylist.tag.TagController
import com.eklimo.dynamicplaylist.tag.TagService
import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.mockk.every
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put

@WebMvcTest(controllers = [TagController::class])
class TagControllerTests {

  private companion object {
    const val ENDPOINT = "/api/v1/tags"

    const val FAKE_TAG_ID = 123L
    const val FAKE_USER_ID = "user"
    const val FAKE_NAME = "tag"
    const val FAKE_COLOR = 1
  }

  @Autowired private lateinit var mockMvc: MockMvc
  @Autowired private lateinit var mapper: ObjectMapper

  @MockkBean private lateinit var tagService: TagService

  @Test
  fun `get a tag by id`() {
    val expected = TagService.GetTagResponse(Tag(FAKE_USER_ID, FAKE_NAME, FAKE_COLOR))

    every { tagService.getTagByID(Tag.ID(FAKE_TAG_ID)) } returns expected.right()

    mockMvc
      .get("$ENDPOINT/$FAKE_TAG_ID") { accept = MediaType.APPLICATION_JSON }
      .andExpect {
        status { isOk() }
        content { string(mapper.writeValueAsString(expected)) }
      }
  }

  @Test
  fun `get a tag that doesn't exist`() {
    val expected = TagService.Error.NotFound(Tag.ID(FAKE_TAG_ID))

    every { tagService.getTagByID(Tag.ID(FAKE_TAG_ID)) } returns expected.left()

    mockMvc
      .get("$ENDPOINT/$FAKE_TAG_ID") { accept = MediaType.APPLICATION_JSON }
      .andExpect { status { isNotFound() } }
  }

  @Test
  fun `create a tag`() {
    val requestBody = TagController.CreateTagRequest(FAKE_USER_ID, FAKE_NAME, FAKE_COLOR)

    val expected = TagService.CreateTagResponse(Tag.ID(FAKE_TAG_ID))

    every { tagService.createTag(FAKE_USER_ID, FAKE_NAME, FAKE_COLOR) } returns expected.right()

    mockMvc
      .post(ENDPOINT) {
        contentType = MediaType.APPLICATION_JSON
        content = mapper.writeValueAsString(requestBody)
      }
      .andExpect {
        status { isOk() }
        content { string(mapper.writeValueAsString(expected)) }
      }
  }

  @Test
  fun `create a tag with a name that already exists`() {
    val requestBody = TagController.CreateTagRequest(FAKE_USER_ID, FAKE_NAME, FAKE_COLOR)

    val expected = TagService.Error.NameAlreadyExists(FAKE_USER_ID, FAKE_NAME)

    every { tagService.createTag(FAKE_USER_ID, FAKE_NAME, FAKE_COLOR) } returns expected.left()

    mockMvc
      .post(ENDPOINT) {
        contentType = MediaType.APPLICATION_JSON
        content = mapper.writeValueAsString(requestBody)
      }
      .andExpect { status { isConflict() } }
  }

  @Test
  fun `create a tag using a malformed request - missing fields`() {
    val requestBody =
      """
        {
          "color": "$FAKE_COLOR"
        }
      """
        .trimIndent()

    mockMvc
      .post(ENDPOINT) {
        contentType = MediaType.APPLICATION_JSON
        content = requestBody
      }
      .andExpect { status { isBadRequest() } }
  }

  @Test
  fun `create a tag using a malformed request - blank field`() {
    val requestBody =
      """
        {
          "userID": "$FAKE_USER_ID",
          "name": "",
          "color": "$FAKE_COLOR"
        }
      """
        .trimIndent()

    mockMvc
      .post(ENDPOINT) {
        contentType = MediaType.APPLICATION_JSON
        content = requestBody
      }
      .andExpect { status { isBadRequest() } }
  }

  @Test
  fun `delete a tag`() {
    val expected = Unit

    every { tagService.deleteTag(Tag.ID(FAKE_TAG_ID)) } returns expected.right()

    mockMvc.delete("$ENDPOINT/$FAKE_TAG_ID").andExpect { status { isOk() } }
  }

  @Test
  fun `delete a tag that doesn't exist`() {
    val expected = TagService.Error.NotFound(Tag.ID(FAKE_TAG_ID))

    every { tagService.deleteTag(Tag.ID(FAKE_TAG_ID)) } returns expected.left()

    mockMvc.delete("$ENDPOINT/$FAKE_TAG_ID").andExpect { status { isNotFound() } }
  }

  @Test
  fun `update a tag`() {
    val newColor = FAKE_COLOR + 1
    val requestBody = TagController.UpdateTagRequest(color = newColor)

    val expected = Unit

    every { tagService.updateTag(Tag.ID(FAKE_TAG_ID), color = newColor) } returns expected.right()

    mockMvc
      .put("$ENDPOINT/$FAKE_TAG_ID") {
        contentType = MediaType.APPLICATION_JSON
        content = mapper.writeValueAsString(requestBody)
      }
      .andExpect {
        status { isOk() }
        content { string(mapper.writeValueAsString(expected)) }
      }
  }

  @Test
  fun `update a tag that doesn't exist`() {
    val newColor = FAKE_COLOR + 1
    val requestBody = TagController.UpdateTagRequest(color = newColor)

    val expected = TagService.Error.NotFound(Tag.ID(FAKE_TAG_ID))

    every { tagService.updateTag(Tag.ID(FAKE_TAG_ID), color = newColor) } returns expected.left()

    mockMvc
      .put("$ENDPOINT/$FAKE_TAG_ID") {
        contentType = MediaType.APPLICATION_JSON
        content = mapper.writeValueAsString(requestBody)
      }
      .andExpect { status { isNotFound() } }
  }

  @Test
  fun `update a tag using a malformed request - invalid color`() {
    val requestBody =
      """
      {
        "userID": "$FAKE_USER_ID",
        "color": 0
      }
    """
        .trimIndent()

    mockMvc
      .put("$ENDPOINT/$FAKE_TAG_ID") {
        contentType = MediaType.APPLICATION_JSON
        content = requestBody
      }
      .andExpect { status { isBadRequest() } }
  }

  @Test
  fun `get a user's tags`() {
    val expected = TagService.TagsForUserResponse(listOf(Tag.ID(FAKE_TAG_ID)))

    every { tagService.getTagsForUser(FAKE_USER_ID) } returns expected

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
  fun `get a user's tags when they have none`() {
    val expected = TagService.TagsForUserResponse(emptyList())

    every { tagService.getTagsForUser(FAKE_USER_ID) } returns expected

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
}
