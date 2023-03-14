package com.eklimo.dynamicplaylist

import arrow.core.left
import arrow.core.right
import com.eklimo.dynamicplaylist.authorization.AccessTokenResponse
import com.eklimo.dynamicplaylist.authorization.AppAuthorizationResponse
import com.eklimo.dynamicplaylist.authorization.AuthorizationController
import com.eklimo.dynamicplaylist.authorization.AuthorizationService
import com.ninjasquad.springmockk.MockkBean
import io.mockk.every
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@WebMvcTest(controllers = [AuthorizationController::class])
class AuthorizationControllerTests {

  private companion object {
    const val ENDPOINT = "/authorize"

    const val FAKE_CLIENT_ID = "1234"
    const val FAKE_AUTHORIZATION_CODE = "1234"
    const val FAKE_AUTHORIZATION_ERROR = "access_denied"
    const val FAKE_STATE = "1234"

    const val FAKE_ACCESS_TOKEN = "1234"
    const val FAKE_EXPIRES_IN = 1000
    const val FAKE_REFRESH_TOKEN = "1234"
  }

  @Autowired private lateinit var mockMvc: MockMvc

  @MockkBean private lateinit var authorizationService: AuthorizationService

  @Test
  fun `authorize the app`() {
    every { authorizationService.spotifyClientID } returns FAKE_CLIENT_ID

    mockMvc.get(ENDPOINT).andExpect { status { isFound() } }
  }

  @Test
  fun `request an access token after app authorization succeeded`() {
    val requestParams = AppAuthorizationResponse.Success(FAKE_AUTHORIZATION_CODE, FAKE_STATE)

    every { authorizationService.handleAuthorizationResponse(requestParams) } returns
      AccessTokenResponse(FAKE_ACCESS_TOKEN, FAKE_EXPIRES_IN, FAKE_REFRESH_TOKEN).right()

    mockMvc
      .get(ENDPOINT) {
        param("code", requestParams.code)
        param("state", requestParams.state)
      }
      .andExpect { status { isFound() } }
  }

  @Test
  fun `server error after app authorization failed`() {
    val requestParams = AppAuthorizationResponse.Failure(FAKE_AUTHORIZATION_ERROR, FAKE_STATE)

    every { authorizationService.handleAuthorizationResponse(requestParams) } returns
      AuthorizationService.Error.AccessDenied.left()

    mockMvc
      .get(ENDPOINT) {
        param("error", requestParams.error)
        param("state", requestParams.state)
      }
      .andExpect { status { is5xxServerError() } }
  }
}
