package com.eklimo.dynamicplaylist.tag

import arrow.core.Either
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
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
class TagController(private val tagService: TagService) {

  private val TagService.Error.status
    get() =
      when (this) {
        is TagService.Error.NotFound -> HttpStatus.NOT_FOUND
        is TagService.Error.NameAlreadyExists -> HttpStatus.CONFLICT
      }

  private fun <A : TagService.Error, B> Either<A, B>.handleError() =
    fold(ifRight = { it }, ifLeft = { error -> ResponseEntity.status(error.status).body(null) })

  @GetMapping("/{tagID}")
  fun getTagByID(@PathVariable tagID: Long) = tagService.getTagByID(tagID).handleError()

  @PostMapping
  fun createTag(@RequestBody req: CreateTagRequest) =
    tagService
      .createTag(
        userID = req.userID,
        name = req.name,
        color = req.color,
        description = req.description
      )
      .handleError()

  data class CreateTagRequest(
    val userID: String,
    val name: String,
    val color: Int,
    val description: String = ""
  )

  @DeleteMapping("/{tagID}")
  fun deleteTag(@PathVariable tagID: Long) = tagService.deleteTag(tagID).handleError()

  @PutMapping("/{tagID}")
  fun updateTag(@PathVariable tagID: Long, @RequestBody req: UpdateTagRequest) =
    tagService
      .updateTag(tagID, name = req.name, color = req.color, description = req.description)
      .handleError()

  data class UpdateTagRequest(
    val name: String? = null,
    val color: Int? = null,
    val description: String? = null
  )

  @GetMapping
  fun getTagsForUser(@RequestParam("user") userID: String) = tagService.getTagsForUser(userID)
}
