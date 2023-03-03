package com.eklimo.dynamicplaylist

import org.springframework.stereotype.Service

@Service
object TagService {
  fun getTags() = listOf(Tag(id = "a", name = "x", color = 1), Tag(id = "b", name = "y", color = 1))
}
