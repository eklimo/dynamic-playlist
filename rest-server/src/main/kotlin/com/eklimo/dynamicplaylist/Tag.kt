package com.eklimo.dynamicplaylist

data class Tag(
  val id: String,
  val name: String,
  val color: Int,
  val description: String? = null,
)

// interface TagRepository : CrudRepository<Tag, Int>
