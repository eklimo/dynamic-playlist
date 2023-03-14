package com.eklimo.dynamicplaylist.authorization

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty

/**
 * A response from the Spotify Account service's `/api/token` endpoint when requesting an access
 * token.
 *
 * After the [accessToken] is granted, it expires after [expiresIn] seconds and must be refreshed by
 * requesting a new access token from the `/api/token` endpoint using the [refreshToken]. See
 * [Spotify documentation](https://developer.spotify.com/documentation/general/guides/authorization/code-flow/)
 * for more details.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
data class AccessTokenResponse(
  /** An access token that can be used in Spotify API requests. */
  @JsonProperty("access_token") val accessToken: String,

  /** The number of seconds for which the access token is valid. */
  @JsonProperty("expires_in") val expiresIn: Int,

  /**
   * A token that can be used to obtain a new access token after it has expired.
   *
   * If the request was made using an existing refresh token, a new refresh token may or may not be
   * provided.
   */
  @JsonProperty("refresh_token") val refreshToken: String?
)
