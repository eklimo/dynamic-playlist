package com.eklimo.dynamicplaylist.library

import com.eklimo.dynamicplaylist.ControllerBase
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/generate")
@CrossOrigin(origins = ["http://localhost:8081"])
class GenerationController(private val generationService: GenerationService) :
  ControllerBase<GenerationService.Error> {

  override fun statusOf(error: GenerationService.Error) =
    when (error) {
      is GenerationService.Error.BadToken -> HttpStatus.UNAUTHORIZED
      is GenerationService.Error.BadOAuthRequest -> HttpStatus.FORBIDDEN
      is GenerationService.Error.RateLimited -> HttpStatus.TOO_MANY_REQUESTS
      is GenerationService.Error.NoTracks -> HttpStatus.BAD_REQUEST
      is GenerationService.Error.Unknown -> HttpStatus.INTERNAL_SERVER_ERROR
    }

  private fun accessTokenOf(authHeader: String) = authHeader.split(" ").last()

  @PostMapping
  fun generate(
    @Valid @RequestBody req: GenerateRequest,
    @RequestHeader("Authorization") authHeader: String,
  ) =
    generationService
      .generate(
        userID = req.userID,
        include = req.include,
        exclude = req.exclude,
        mode = req.mode,
        name = req.name,
        description = req.description,
        accessToken = accessTokenOf(authHeader)
      )
      .formatOutput()

  data class GenerateRequest(
    @field:NotBlank val userID: String,
    val include: Set<Long>,
    val exclude: Set<Long>,
    val mode: GenerationService.FilterMode,
    @field:NotBlank val name: String,
    val description: String? = null,
  )
}
