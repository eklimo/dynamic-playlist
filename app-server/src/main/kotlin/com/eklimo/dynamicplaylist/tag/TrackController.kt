package com.eklimo.dynamicplaylist.tag

import com.eklimo.dynamicplaylist.ControllerBase
import jakarta.validation.Valid
import jakarta.validation.constraints.Positive
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.CrossOrigin
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
@CrossOrigin(origins = ["http://localhost:8081"])
class TrackController(private val trackService: TrackService) : ControllerBase<TrackService.Error> {

  override fun statusOf(error: TrackService.Error) =
    when (error) {
      is TrackService.Error.NotFound -> HttpStatus.NOT_FOUND
      is TrackService.Error.TrackHasTag -> HttpStatus.CONFLICT
      is TrackService.Error.TrackHasNoTag -> HttpStatus.NOT_FOUND
    }

  @GetMapping
  fun getTagsForTrack(@PathVariable trackID: String, @RequestParam("user") userID: String) =
    trackService.getTagsForTrack(userID, trackID)

  @PostMapping
  fun addTagToTrack(@PathVariable trackID: String, @Valid @RequestBody req: AddTagRequest) =
    trackService.addTagToTrack(trackID, tagID = req.tagID).formatOutput()

  data class AddTagRequest(@field:Positive val tagID: Long)

  @DeleteMapping
  fun removeTagFromTrack(@PathVariable trackID: String, @Valid @RequestBody req: RemoveTagRequest) =
    trackService.removeTagFromTrack(trackID, tagID = req.tagID).formatOutput()

  data class RemoveTagRequest(@field:Positive val tagID: Long)
}
