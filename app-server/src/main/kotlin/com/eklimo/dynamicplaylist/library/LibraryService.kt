package com.eklimo.dynamicplaylist.library

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import org.springframework.stereotype.Service

@Service
class LibraryService(private val spotifyService: SpotifyService) {

  sealed interface Error {
    data object BadToken : Error
    data object BadOAuthRequest : Error
    data object RateLimited : Error
    data object Unknown : Error
  }

  private fun mapError(error: SpotifyService.Error) =
    when (error) {
      is SpotifyService.Error.BadToken -> Error.BadToken
      is SpotifyService.Error.BadOAuthRequest -> Error.BadOAuthRequest
      is SpotifyService.Error.RateLimited -> Error.RateLimited
      is SpotifyService.Error.Unknown -> Error.Unknown
    }

  /** https://api.spotify.com/v1/me/tracks */
  fun getSavedTracks(offset: Int, limit: Int, accessToken: String) =
    spotifyService
      .get<SavedTracksResponse>(accessToken) {
        path("/me/tracks")
        queryParam("offset", offset)
        queryParam("limit", limit)
      }
      .mapLeft(::mapError)

  data class SavedTracksResponse(
    val count: Int,
    val tracks: List<Track>,
  ) {
    companion object {
      @JvmStatic
      @JsonCreator
      fun new(
        total: Int,
        items: List<SavedTrack>,
      ) = SavedTracksResponse(count = total, tracks = items.map { it.track })
    }
  }

  /** https://api.spotify.com/v1/me */
  fun getUserProfile(accessToken: String) =
    spotifyService.get<UserProfileResponse>(accessToken) { path("/me") }.mapLeft(::mapError)

  data class UserProfileResponse(
    val id: String,
    @JsonProperty("display_name") val displayName: String,
  )
}
