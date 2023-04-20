package com.eklimo.dynamicplaylist.tag

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface TagRepository : JpaRepository<Tag, Long> {

  fun findAllByUserID(userID: String): Iterable<Tag>

  fun findByUserIDAndName(userID: String, name: String): Tag?

  fun findAllByUserIDEqualsAndTracksContains(userID: String, trackID: String): Iterable<Tag>
}
