package com.eklimo.dynamicplaylist.tag

import arrow.core.Either
import jakarta.validation.Valid
import jakarta.validation.constraints.Positive
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/tracks/{trackID}")
class TrackController(private val trackService: TrackService) {

  private val TrackService.Error.status
    get() =
      when (this) {
        is TrackService.Error.NotFound -> HttpStatus.NOT_FOUND
        is TrackService.Error.TrackHasTag -> HttpStatus.CONFLICT
        is TrackService.Error.TrackHasNoTag -> HttpStatus.NOT_FOUND
      }

  private fun <A : TrackService.Error, B> Either<A, B>.handleError() =
    fold(ifRight = { it }, ifLeft = { error -> ResponseEntity.status(error.status).body(null) })

  @GetMapping
  fun getTagsForTrack(@PathVariable trackID: String, @RequestParam("user") userID: String) =
    trackService.getTagsForTrack(userID, trackID)

  @PostMapping
  fun addTagToTrack(@PathVariable trackID: String, @Valid @RequestBody req: AddTagRequest) =
    trackService.addTagToTrack(trackID, tagID = req.tagID).handleError()

  data class AddTagRequest(@field:Positive val tagID: Long)

  @DeleteMapping
  fun removeTagFromTrack(@PathVariable trackID: String, @Valid @RequestBody req: RemoveTagRequest) =
    trackService.removeTagFromTrack(trackID, tagID = req.tagID).handleError()

  data class RemoveTagRequest(@field:Positive val tagID: Long)
}
