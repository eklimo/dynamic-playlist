package com.eklimo.dynamicplaylist.authorization

import arrow.core.Either
import arrow.core.raise.either
import arrow.core.raise.ensure
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatusCode
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.web.client.postForEntity
import org.springframework.web.util.UriComponentsBuilder
import java.net.URI

/**
 * Implements Spotify
 * [Authorization Code Flow](https://developer.spotify.com/documentation/general/guides/authorization/code-flow/).
 */
@Service
class AuthorizationService(
  /**
   * Spotify ID for this application. See
   * [Spotify documentation](https://developer.spotify.com/documentation/general/guides/authorization/app-settings/).
   */
  @Value("\${com.eklimo.dynamicplaylist.spotify-client-id}") val spotifyClientID: String,
  /**
   * Key used to authorize Spotify API calls. See
   * [Spotify documentation](https://developer.spotify.com/documentation/general/guides/authorization/app-settings/).
   */
  @Value("\${com.eklimo.dynamicplaylist.spotify-client-secret}") val spotifyClientSecret: String
) {

  companion object {
    /** The hostname of the Spotify Accounts service */
    private const val spotifyHostname = "accounts.spotify.com"
    /** The path of the app authorization endpoint on the Spotify Accounts service */
    private const val spotifyAuthorizePath = "/authorize"
    /** The path of the access token request endpoint on the Spotify Accounts service */
    private const val spotifyTokenPath = "/api/token"
    /**
     * The authorization scopes granted to this app by the user. See
     * [Spotify documentation](https://developer.spotify.com/documentation/general/guides/authorization/scopes/).
     */
    private val spotifyScope =
      setOf(
        "playlist-read-private",
        "playlist-modify-private",
        "playlist-modify-public",
        "user-library-read",
        "user-read-private",
        "user-read-email"
      )

    /**
     * The URI that Spotify redirects to after the user authorizes this app. It must exactly match
     * the redirect URI specified in the Spotify developer dashboard.
     */
    private const val redirectURI = "http://localhost:8080/authorize"

    /**
     * The base of the URI to redirect to after authorization is completed. [buildClientRedirectURI]
     * adds query parameters to this URI before redirecting to it.
     */
    private const val baseClientRedirectURI = "http://localhost:8081/authorize"

    /**
     * Builds the [URI] to redirect to when the client initially requests authorization. The URI is
     * an endpoint on the Spotify Accounts service that allows the user to authorize or reject the
     * app.
     */
    fun buildAppAuthorizationURI(clientID: String) =
      UriComponentsBuilder.newInstance()
        .scheme("https")
        .host(spotifyHostname)
        .path(spotifyAuthorizePath)
        .query("response_type=code")
        .query("client_id=$clientID")
        .query("scope=${spotifyScope.joinToString(separator = " ")}")
        .query("redirect_uri=$redirectURI")
        .query("state=${1234}") // TODO: state
        .build()
        .toUri()

    /** Builds the [URI] to request an access token from the Spotify Accounts service */
    fun buildAccessTokenURI(authorizationCode: String) =
      UriComponentsBuilder.newInstance()
        .scheme("https")
        .host(spotifyHostname)
        .path(spotifyTokenPath)
        .query("grant_type=authorization_code")
        .query("code=$authorizationCode")
        .query("redirect_uri=$redirectURI")
        .build()
        .toUri()

    /**
     * Builds the [URI] to redirect to after authorization is completed. The URI is based on
     * [baseClientRedirectURI], and a query parameter is added for each field in
     * [AccessTokenResponse] to allow the client to store them locally.
     */
    fun buildClientRedirectURI(response: AccessTokenResponse) =
      UriComponentsBuilder.fromUri(URI.create(baseClientRedirectURI))
        .query("access_token=${response.accessToken}")
        .query("expires_in=${response.expiresIn}")
        .query("refresh_token=${response.refreshToken}")
        .build()
        .toUri()
  }

  sealed interface Error {
    /**
     * The state returned in an [AppAuthorizationResponse] does not match the one generated in the
     * request. See
     * [OAuth documentation](https://auth0.com/docs/secure/attack-protection/state-parameters).
     */
    data object InvalidOAuthState : Error
    /** The user denied the authorization of this app. */
    data object AccessDenied : Error
    /** The authorization of this app failed for an unknown reason. */
    data class AuthorizationFailed(val reason: String) : Error
    /** An unknown error was encountered. */
    data class Unknown(val status: HttpStatusCode) : Error
  }

  /** Requests an access token from the Spotify Account service using the [authorizationCode]. */
  private fun requestAccessToken(
    authorizationCode: String
  ): Either<Error.Unknown, AccessTokenResponse> = either {
    val tokenURI = buildAccessTokenURI(authorizationCode)

    val headers =
      HttpHeaders().apply {
        contentType = MediaType.APPLICATION_FORM_URLENCODED
        setBasicAuth(spotifyClientID, spotifyClientSecret)
      }
    val body = ""

    val response =
      RestTemplate()
        .postForEntity<AccessTokenResponse>(url = tokenURI, request = HttpEntity(body, headers))

    ensure(!response.statusCode.isError) { Error.Unknown(response.statusCode) }

    // body is not null if the status code is not an error
    response.body!!
  }

  /**
   * Handles a user's authorization decision for this app. See [AppAuthorizationResponse].
   *
   * If the app is authorized, this [requests][requestAccessToken] and returns an
   * [access token][AccessTokenResponse].
   */
  fun handleAuthorizationResponse(
    response: AppAuthorizationResponse
  ): Either<Error, AccessTokenResponse> = either {
    ensure(response.state == "1234") { Error.InvalidOAuthState }

    when (response) {
      is AppAuthorizationResponse.Success ->
        requestAccessToken(authorizationCode = response.code).bind()
      is AppAuthorizationResponse.Failure ->
        raise(
          when (response.error) {
            "access_denied" -> Error.AccessDenied
            else -> Error.AuthorizationFailed(response.error)
          }
        )
    }
  }
}
