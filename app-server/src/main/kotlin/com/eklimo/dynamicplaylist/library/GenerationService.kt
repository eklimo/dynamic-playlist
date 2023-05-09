package com.eklimo.dynamicplaylist.library

import arrow.core.Either
import arrow.core.raise.either
import arrow.core.raise.ensure
import com.eklimo.dynamicplaylist.tag.TagRepository
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import org.springframework.stereotype.Service

@Service
class GenerationService(
  private val spotifyService: SpotifyService,
  val tagRepository: TagRepository
) {

  sealed interface Error {
    data object BadToken : Error
    data object BadOAuthRequest : Error
    data object RateLimited : Error
    data object NoTracks : Error
    data object Unknown : Error
  }

  private fun mapError(error: SpotifyService.Error) =
    when (error) {
      is SpotifyService.Error.BadToken -> Error.BadToken
      is SpotifyService.Error.BadOAuthRequest -> Error.BadOAuthRequest
      is SpotifyService.Error.RateLimited -> Error.RateLimited
      is SpotifyService.Error.Unknown -> Error.Unknown
    }

  enum class FilterMode {
    ALL,
    ANY
  }

  fun generate(
    userID: String,
    include: Set<Long> = emptySet(),
    exclude: Set<Long> = emptySet(),
    mode: FilterMode,
    name: String,
    description: String?,
    accessToken: String
  ): Either<Error, GenerateResponse> = either {
    val tracks = filter(include, exclude, mode).bind()

    // TODO: expose `public` to client
    val createReq = CreatePlaylistRequest(name, description, public = false)
    val createRes = createPlaylist(createReq, userID, accessToken).bind()

    val playlistID = createRes.playlistID

    val addReq = AddTracksToPlaylistRequest(tracks.map { "spotify:track:$it" })
    addTracksToPlaylist(addReq, playlistID, accessToken).bind()

    val getRes = getPlaylist(playlistID, accessToken).bind()

    GenerateResponse(getRes.url, getRes.image)
  }

  data class GenerateResponse(
    val url: String,
    val image: Image,
  )

  /** https://api.spotify.com/v1/users/{user_id}/playlists */
  private fun createPlaylist(req: CreatePlaylistRequest, userID: String, accessToken: String) =
    spotifyService
      .post<CreatePlaylistRequest, CreatePlaylistResponse>(accessToken, body = req) {
        path("/users/$userID/playlists")
      }
      .mapLeft(::mapError)

  private data class CreatePlaylistRequest(
    val name: String,
    val description: String?,
    val public: Boolean,
  )
  private data class CreatePlaylistResponse(
    @JsonProperty("id") val playlistID: String,
  )

  /** https://api.spotify.com/v1/playlists/{playlist_id}/tracks */
  private fun addTracksToPlaylist(
    req: AddTracksToPlaylistRequest,
    playlistID: String,
    accessToken: String
  ) =
    spotifyService
      .post<AddTracksToPlaylistRequest, AddTracksToPlaylistResponse>(accessToken, body = req) {
        path("/playlists/$playlistID/tracks")
      }
      .mapLeft(::mapError)

  private data class AddTracksToPlaylistRequest(
    val uris: Iterable<String>,
  )
  private data object AddTracksToPlaylistResponse

  /** https://api.spotify.com/v1/playlists/{playlist_id} */
  private fun getPlaylist(playlistID: String, accessToken: String) =
    spotifyService
      .get<PlaylistResponse>(accessToken) { path("/playlists/$playlistID") }
      .mapLeft(::mapError)

  private data class PlaylistResponse(val url: String, val image: Image) {
    companion object {
      @JvmStatic
      @JsonCreator
      fun new(@JsonProperty("external_urls") externalURLs: ExternalURLs, images: List<Image>) =
        PlaylistResponse(externalURLs.spotify, image = images.first())
    }
  }

  private fun filter(
    include: Set<Long> = emptySet(),
    exclude: Set<Long> = emptySet(),
    mode: FilterMode
  ): Either<Error, List<String>> = either {
    val trackToTags = buildTrackToTagMap()

    val tracks =
      trackToTags
        .filterValues { tags ->
          val includeFilters = include.asSequence().map { it in tags }
          val excludeFilters = exclude.asSequence().map { it !in tags }

          val filters = includeFilters + excludeFilters
          when (mode) {
            FilterMode.ALL -> filters.all { it }
            FilterMode.ANY -> filters.any { it }
          }
        }
        .map { it.key }

    ensure(tracks.isNotEmpty()) { Error.NoTracks }

    tracks
  }

  private fun buildTrackToTagMap(): Map<String, Set<Long>> {
    val map = mutableMapOf<String, MutableSet<Long>>()
    tagRepository.findAll().forEach { tag ->
      tag.tracks.forEach { track ->
        map.getOrPut(track, defaultValue = { mutableSetOf() }).add(tag.tagID)
      }
    }

    return map.toMap().mapValues { it.value.toSet() }
  }
}
