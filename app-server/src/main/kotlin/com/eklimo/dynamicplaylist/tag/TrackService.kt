package com.eklimo.dynamicplaylist.tag

import arrow.core.Either
import arrow.core.raise.either
import arrow.core.raise.ensure
import arrow.core.raise.ensureNotNull
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service

@Service
class TrackService(private val tagRepository: TagRepository) {

  sealed interface Error {
    /** The [tagID] does not refer to an existing [Tag]. */
    data class NotFound(val tagID: Long) : Error
    /** The [tag][tagID] already exists on the [track][trackID]. */
    data class TrackHasTag(val trackID: String, val tagID: Long) : Error
    /** The [tag][tagID] does not exists on the [track][trackID]. */
    data class TrackHasNoTag(val trackID: String, val tagID: Long) : Error
  }

  fun getTagsForTrack(userID: String, trackID: String) =
    TagsForTrackResponse(
      tagRepository.findAllByUserIDEqualsAndTracksContains(userID, trackID).map { it.tagID }
    )

  data class TagsForTrackResponse(val tagIDs: List<Long>)

  fun addTagToTrack(trackID: String, tagID: Long): Either<Error, Unit> = either {
    val tag = tagRepository.findByIdOrNull(tagID)
    ensureNotNull(tag) { Error.NotFound(tagID) }

    ensure(trackID !in tag.tracks) { Error.TrackHasTag(trackID, tagID) }

    tag.tracks.add(trackID)
    tagRepository.save(tag)
  }

  fun removeTagFromTrack(trackID: String, tagID: Long): Either<Error, Unit> = either {
    val tag = tagRepository.findByIdOrNull(tagID)
    ensureNotNull(tag) { Error.NotFound(tagID) }

    ensure(trackID in tag.tracks) { Error.TrackHasNoTag(trackID, tagID) }

    tag.tracks.remove(trackID)
    tagRepository.save(tag)
  }
}
