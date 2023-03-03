package com.eklimo.dynamicplaylist

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1")
class TagController(val tagService: TagService) {

  @GetMapping("/") fun index() = "hello world!"
  @GetMapping("/tags") fun getTags() = tagService.getTags()
}
