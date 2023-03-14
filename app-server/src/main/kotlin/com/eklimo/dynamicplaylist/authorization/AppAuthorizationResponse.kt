package com.eklimo.dynamicplaylist.authorization

import jakarta.validation.constraints.NotBlank
import org.springframework.core.MethodParameter
import org.springframework.web.bind.support.WebDataBinderFactory
import org.springframework.web.context.request.NativeWebRequest
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.method.support.ModelAndViewContainer

/**
 * A response from the Spotify Account service's `/authorize` endpoint when requesting app
 * authorization.
 *
 * [Success][AppAuthorizationResponse.Success] or [Failure][AppAuthorizationResponse.Failure] is
 * returned based on the result of authorization. See
 * [Spotify documentation](https://developer.spotify.com/documentation/general/guides/authorization/code-flow/)
 * for more details.
 */
sealed interface AppAuthorizationResponse {
  val state: String

  /** Indicates that the user authorized the app. */
  data class Success(
    /** An authorization code that can be exchanged for an access token. */
    @field:NotBlank val code: String,
    @field:NotBlank override val state: String
  ) : AppAuthorizationResponse

  /** Indicates that an error occurred during app authorization. */
  data class Failure(
    /** The reason authorization failed. */
    @field:NotBlank val error: String,
    @field:NotBlank override val state: String
  ) : AppAuthorizationResponse

  /**
   * Enables deserialization of
   * [RequestParam][org.springframework.web.bind.annotation.RequestParam]s into instances of
   * [AppAuthorizationResponse].
   */
  object ArgumentResolver : HandlerMethodArgumentResolver {
    override fun supportsParameter(parameter: MethodParameter) =
      parameter.parameterType == AppAuthorizationResponse::class.java

    override fun resolveArgument(
      parameter: MethodParameter,
      mavContainer: ModelAndViewContainer?,
      webRequest: NativeWebRequest,
      binderFactory: WebDataBinderFactory?
    ): AppAuthorizationResponse? {
      fun param(name: String) = webRequest.parameterMap[name]?.firstOrNull()

      val code = param("code")
      val error = param("error")
      val state = param("state")

      return when {
        code != null && state != null -> Success(code, state)
        error != null && state != null -> Failure(error, state)
        else -> null
      }
    }
  }
}
