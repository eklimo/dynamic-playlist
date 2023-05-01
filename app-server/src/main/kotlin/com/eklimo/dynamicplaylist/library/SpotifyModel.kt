package com.eklimo.dynamicplaylist.library

import com.fasterxml.jackson.annotation.JsonCreator

data class SavedTrack(
  val track: Track,
)

data class Track(
  val id: String,
  val name: String,
  val album: Album,
  val artists: List<String>,
) {
  companion object {
    @JvmStatic
    @JsonCreator
    fun new(id: String, name: String, album: Album, artists: List<Artist>) =
      Track(id, name, album, artists.map { it.name })
  }
}

data class Album(
  val name: String,
  val image: Image,
) {
  companion object {
    @JvmStatic @JsonCreator fun new(name: String, images: List<Image>) = Album(name, images.first())
  }
}

data class Artist(
  val name: String,
)

data class Image(
  val url: String,
  val width: Int,
  val height: Int,
)
