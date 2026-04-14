package com.inventorysaas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import com.inventorysaas.config.AppProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class InventorySaasApplication {
    public static void main(String[] args) {
        SpringApplication.run(InventorySaasApplication.class, args);
    }
}
