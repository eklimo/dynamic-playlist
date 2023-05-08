package com.eklimo.dynamicplaylist.library

import com.eklimo.dynamicplaylist.ControllerBase
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/library")
class LibraryController(private val libraryService: LibraryService) :
  ControllerBase<LibraryService.Error> {

  override fun statusOf(error: LibraryService.Error) =
    when (error) {
      is LibraryService.Error.BadToken -> HttpStatus.UNAUTHORIZED
      is LibraryService.Error.BadOAuthRequest -> HttpStatus.FORBIDDEN
      is LibraryService.Error.RateLimited -> HttpStatus.TOO_MANY_REQUESTS
      is LibraryService.Error.Unknown -> HttpStatus.INTERNAL_SERVER_ERROR
    }

  private fun accessTokenOf(authHeader: String) = authHeader.split(" ").last()

  /** https://api.spotify.com/v1/me/tracks */
  @GetMapping("/tracks")
  fun getSavedTracks(
    @RequestParam(defaultValue = "0") offset: Int,
    @RequestParam(defaultValue = "20") limit: Int,
    @RequestHeader("Authorization") authHeader: String,
  ) = libraryService.getSavedTracks(offset, limit, accessTokenOf(authHeader)).formatOutput()

  /** https://api.spotify.com/v1/me */
  @GetMapping("/profile")
  fun getUserProfile(
    @RequestHeader("Authorization") authHeader: String,
  ) = libraryService.getUserProfile(accessTokenOf(authHeader)).formatOutput()
}
