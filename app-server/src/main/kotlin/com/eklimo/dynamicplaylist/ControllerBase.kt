package com.eklimo.dynamicplaylist

import arrow.core.Either
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity

interface ControllerBase<ErrorType> {

  fun statusOf(error: ErrorType): HttpStatus

  fun <A : ErrorType, B : Any> Either<A, B>.formatOutput(): Any =
    when (this) {
      is Either.Left -> ResponseEntity.status(statusOf(this.value)).body(null)
      is Either.Right ->
        when (this.value) {
          Unit -> ResponseEntity.ok().body(null)
          else -> this.value
        }
    }
}
