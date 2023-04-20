package com.eklimo.dynamicplaylist.tag

import arrow.core.Either
import arrow.core.raise.either
import arrow.core.raise.ensure
import arrow.core.raise.ensureNotNull
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service

@Service
class TagService(private val tagRepository: TagRepository) {

  sealed interface Error {
    /** The [tagID] does not refer to an existing [Tag]. */
    data class NotFound(val tagID: Long) : Error
    /** The [name] of the tag already exists for the [user][userID]. */
    data class NameAlreadyExists(val userID: String, val name: String) : Error
  }

  fun getTagByID(tagID: Long): Either<Error.NotFound, GetTagResponse> = either {
    val tag = tagRepository.findByIdOrNull(tagID)
    ensureNotNull(tag) { Error.NotFound(tagID) }

    GetTagResponse(tag)
  }

  data class GetTagResponse(val tag: Tag)

  fun createTag(
    userID: String,
    name: String,
    color: Int,
    description: String = ""
  ): Either<Error.NameAlreadyExists, CreateTagResponse> = either {
    ensure(tagRepository.findByUserIDAndName(userID, name) == null) {
      Error.NameAlreadyExists(userID, name)
    }

    val tag = tagRepository.save(Tag(userID, name, color, description))

    CreateTagResponse(tag.tagID)
  }

  data class CreateTagResponse(val tagID: Long)

  fun deleteTag(tagID: Long): Either<Error.NotFound, Unit> = either {
    val tag = tagRepository.findByIdOrNull(tagID)
    ensureNotNull(tag) { Error.NotFound(tagID) }

    tagRepository.delete(tag)
  }

  fun updateTag(
    tagID: Long,
    name: String? = null,
    color: Int? = null,
    description: String? = null
  ): Either<Error.NotFound, Unit> = either {
    val tag = tagRepository.findByIdOrNull(tagID)
    ensureNotNull(tag) { Error.NotFound(tagID) }

    if (name != null) tag.name = name
    if (color != null) tag.color = color
    if (description != null) tag.description = description

    tagRepository.save(tag)
  }

  fun getTagsForUser(userID: String) =
    TagsForUserResponse(tagRepository.findAllByUserID(userID).map { it.tagID })

  data class TagsForUserResponse(val tagIDs: List<Long>)
}
