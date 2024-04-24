package ucmo.senior_project.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import ucmo.senior_project.middleware.LoginInterceptor;

import java.util.Arrays;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    LoginInterceptor LoginIntercept;

    @Override
    public void addInterceptors(InterceptorRegistry registry){
        registry.addInterceptor(LoginIntercept).addPathPatterns("/**").excludePathPatterns(Arrays.asList(new String[]{"/gameuser/game/auth", "/authuser/login","/authuser/join"}));
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                //.allowedOrigins("http://localhost:3000/") TODO, add securiy measure in for other server
                .allowedOriginPatterns("*")
                .allowedMethods("*")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}