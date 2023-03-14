package com.eklimo.dynamicplaylist

import com.eklimo.dynamicplaylist.authorization.AppAuthorizationResponse
import org.springframework.context.annotation.Configuration
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class WebConfig : WebMvcConfigurer {
  override fun addArgumentResolvers(resolvers: MutableList<HandlerMethodArgumentResolver>) {
    resolvers += AppAuthorizationResponse.ArgumentResolver
  }
}
