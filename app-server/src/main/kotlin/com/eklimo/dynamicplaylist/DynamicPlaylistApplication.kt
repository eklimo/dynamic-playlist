package com.eklimo.dynamicplaylist

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@SpringBootApplication class DynamicPlaylistApplication

@RestController
class HealthController {
  /** Returns a `200 OK` response, indicating that the server is healthy. */
  @GetMapping("/health") fun healthCheck() = ResponseEntity.ok().build<Nothing>()
}

fun main(args: Array<String>) {
  runApplication<DynamicPlaylistApplication>(*args)
}
