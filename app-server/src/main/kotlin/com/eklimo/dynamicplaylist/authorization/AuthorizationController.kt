package com.eklimo.dynamicplaylist.authorization

import arrow.core.Either
import arrow.core.raise.either
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping

/**
 * Implements Spotify
 * [Authorization Code Flow](https://developer.spotify.com/documentation/general/guides/authorization/code-flow/).
 */
@Controller
@RequestMapping("/authorize")
class AuthorizationController(private val authorizationService: AuthorizationService) {

  private val AuthorizationService.Error.status
    get() =
      when (this) {
        // TODO
        is AuthorizationService.Error.InvalidOAuthState -> HttpStatus.INTERNAL_SERVER_ERROR
        is AuthorizationService.Error.AccessDenied -> HttpStatus.INTERNAL_SERVER_ERROR
        is AuthorizationService.Error.AuthorizationFailed -> HttpStatus.INTERNAL_SERVER_ERROR
        is AuthorizationService.Error.Unknown -> HttpStatus.INTERNAL_SERVER_ERROR
      }

  private fun <A : AuthorizationService.Error, B> Either<A, B>.handleError() =
    fold(ifRight = { it }, ifLeft = { error -> ResponseEntity.status(error.status).body(null) })

  /**
   * Step 1 ([response] is `null`): Redirects to the
   * [app authorization URI][AuthorizationService.buildAppAuthorizationURI] where the user can
   * authorize this app.
   *
   * Step 2 ([response] is provided): After Spotify redirects back to this endpoint with the app
   * authorization [response] provided:
   * 1. Requests an access token using the authorization code provided in the [response]
   * 2. Redirects to the [client redirect URI][AuthorizationService.buildClientRedirectURI] with the
   *    access token.
   */
  @GetMapping
  fun authorize(@Valid response: AppAuthorizationResponse?) =
    either {
        if (response == null) {
          val redirectURI =
            AuthorizationService.buildAppAuthorizationURI(authorizationService.spotifyClientID)
          "redirect:$redirectURI"
        } else {
          val accessTokenResponse =
            authorizationService.handleAuthorizationResponse(response).bind()
          val redirectURI = AuthorizationService.buildClientRedirectURI(accessTokenResponse)
          "redirect:$redirectURI"
        }
      }
      .handleError()
}
