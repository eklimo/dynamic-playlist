package com.eklimo.dynamicplaylist.tag

import jakarta.persistence.CollectionTable
import jakarta.persistence.Column
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn

@Entity
class Tag(
  @Column(nullable = false, name = "user_id") val userID: String,
  @Column(nullable = false) var name: String,
  @Column(nullable = false) var color: Int,
  @Column(nullable = true) var description: String? = null
) {
  @Id @GeneratedValue @Column(nullable = false, name = "tag_id") val tagID: Long = 0

  @ElementCollection
  @CollectionTable(joinColumns = [JoinColumn(name = "tag_id")])
  @Column(nullable = false, name = "track")
  val tracks: MutableSet<String> = mutableSetOf()
}
