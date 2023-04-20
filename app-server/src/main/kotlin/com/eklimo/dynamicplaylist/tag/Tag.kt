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
  @Column(name = "user_id") val userID: String,
  var name: String,
  var color: Int,
  var description: String = ""
) {
  @Id @GeneratedValue @Column(name = "tag_id") val tagID: Long = 0

  @ElementCollection
  @CollectionTable(joinColumns = [JoinColumn(name = "tag_id")])
  @Column(name = "track")
  val tracks: MutableSet<String> = mutableSetOf()
}
