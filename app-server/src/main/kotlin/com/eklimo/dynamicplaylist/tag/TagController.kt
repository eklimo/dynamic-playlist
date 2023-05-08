package com.eklimo.dynamicplaylist.tag

import com.eklimo.dynamicplaylist.ControllerBase
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Positive
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/tags")
@CrossOrigin(origins = ["http://localhost:8081"])
class TagController(private val tagService: TagService) : ControllerBase<TagService.Error> {

  override fun statusOf(error: TagService.Error) =
    when (error) {
      is TagService.Error.NotFound -> HttpStatus.NOT_FOUND
      is TagService.Error.NameAlreadyExists -> HttpStatus.CONFLICT
    }

  @GetMapping("/{tagID}")
  fun getTagByID(@PathVariable tagID: Long) = tagService.getTagByID(tagID).formatOutput()

  @PostMapping
  fun createTag(@Valid @RequestBody req: CreateTagRequest) =
    tagService
      .createTag(
        userID = req.userID,
        name = req.name,
        color = req.color,
        description = req.description
      )
      .formatOutput()

  data class CreateTagRequest(
    @field:NotBlank val userID: String,
    @field:NotBlank val name: String,
    @field:Positive val color: Int,
    val description: String? = null
  )

  @DeleteMapping("/{tagID}")
  fun deleteTag(@PathVariable tagID: Long) = tagService.deleteTag(tagID).formatOutput()

  @PutMapping("/{tagID}")
  fun updateTag(@PathVariable tagID: Long, @Valid @RequestBody req: UpdateTagRequest) =
    tagService
      .updateTag(tagID, name = req.name, color = req.color, description = req.description)
      .formatOutput()

  data class UpdateTagRequest(
    val name: String? = null,
    @field:Positive val color: Int? = null,
    val description: String? = null
  )

  @GetMapping
  fun getTagsForUser(@RequestParam("user") userID: String) = tagService.getTagsForUser(userID)
}
