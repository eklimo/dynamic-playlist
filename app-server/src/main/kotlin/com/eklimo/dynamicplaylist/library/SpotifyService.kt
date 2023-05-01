package com.eklimo.dynamicplaylist.library

import arrow.core.Either
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatusCode
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClientResponseException
import org.springframework.web.client.RestTemplate
import org.springframework.web.client.exchange
import org.springframework.web.util.UriComponentsBuilder
import java.net.URI

@Service
class SpotifyService(val mapper: ObjectMapper) {

  sealed interface Error {
    data object BadToken : Error
    data object BadOAuthRequest : Error
    data object RateLimited : Error
    data class Unknown(val status: HttpStatusCode) : Error
  }

  private companion object {
    const val SPOTIFY_HOSTNAME = "api.spotify.com"
    const val SPOTIFY_API_PATH = "/v1"
  }

  fun buildURI(builder: UriComponentsBuilder.() -> UriComponentsBuilder) =
    UriComponentsBuilder.newInstance()
      .scheme("https")
      .host(SPOTIFY_HOSTNAME)
      .path(SPOTIFY_API_PATH)
      .builder()
      .build()
      .toUri()

  final inline fun <reified ResponseType : Any> get(
    accessToken: String,
    noinline builder: UriComponentsBuilder.() -> UriComponentsBuilder
  ) =
    request<Nothing, ResponseType>(
      method = HttpMethod.GET,
      uri = buildURI(builder),
      accessToken = accessToken,
      body = null
    )

  final inline fun <RequestType : Any, reified ResponseType : Any> post(
    accessToken: String,
    body: RequestType,
    noinline builder: UriComponentsBuilder.() -> UriComponentsBuilder
  ) =
    request<RequestType, ResponseType>(
      method = HttpMethod.POST,
      uri = buildURI(builder),
      accessToken = accessToken,
      body = body
    )

  final inline fun <RequestType : Any, reified ResponseType : Any> request(
    method: HttpMethod,
    uri: URI,
    accessToken: String,
    body: RequestType?
  ) =
    Either.catch {
        val headers =
          HttpHeaders().apply {
            setBearerAuth(accessToken)
            contentType = MediaType.APPLICATION_JSON
          }
        val bodyStr = body?.let { mapper.writeValueAsString(it) } ?: ""

        val response =
          RestTemplate()
            .exchange<ResponseType>(url = uri, method, requestEntity = HttpEntity(bodyStr, headers))

        response.body!!
      }
      .mapLeft { error ->
        when (error) {
          is RestClientResponseException ->
            when (error.statusCode) {
              HttpStatus.UNAUTHORIZED -> Error.BadToken
              HttpStatus.FORBIDDEN -> Error.BadOAuthRequest
              HttpStatus.TOO_MANY_REQUESTS -> Error.RateLimited
              else -> Error.Unknown(error.statusCode)
            }
          else -> Error.Unknown(HttpStatus.INTERNAL_SERVER_ERROR)
        }
      }
}
