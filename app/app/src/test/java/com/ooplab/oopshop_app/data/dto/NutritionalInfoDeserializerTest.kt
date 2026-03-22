package com.ooplab.oopshop_app.data.dto

import com.google.gson.Gson
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class NutritionalInfoDeserializerTest {

    private val gson = Gson()

    @Test
    fun product_parses_nutritional_as_json_string() {
        val json = """{"id":1,"name":"X","price":1.0,"nutritional_info":"{\"kcal\":100}"}"""
        val p = gson.fromJson(json, ProductDto::class.java)
        assertEquals(100.0, (p.nutritionalInfo!!["kcal"] as Number).toDouble(), 0.001)
    }

    @Test
    fun product_parses_nutritional_as_object() {
        val json = """{"id":1,"name":"X","price":1.0,"nutritional_info":{"kcal":50,"nested":{"a":1}}}"""
        val p = gson.fromJson(json, ProductDto::class.java)
        assertEquals(50.0, (p.nutritionalInfo!!["kcal"] as Number).toDouble(), 0.001)
        @Suppress("UNCHECKED_CAST")
        val nested = p.nutritionalInfo["nested"] as Map<String, Any>
        assertEquals(1.0, (nested["a"] as Number).toDouble(), 0.001)
    }

    @Test
    fun product_blank_nutritional_string_is_null() {
        val json = """{"id":1,"name":"X","price":1.0,"nutritional_info":"   "}"""
        val p = gson.fromJson(json, ProductDto::class.java)
        assertNull(p.nutritionalInfo)
    }

    @Test
    fun product_invalid_nutritional_string_is_null() {
        val json = """{"id":1,"name":"X","price":1.0,"nutritional_info":"not-json"}"""
        val p = gson.fromJson(json, ProductDto::class.java)
        assertNull(p.nutritionalInfo)
    }

    @Test
    fun product_array_values_in_nested_object() {
        val json = """{"id":1,"name":"X","price":1.0,"nutritional_info":{"tags":["a","b"]}}"""
        val p = gson.fromJson(json, ProductDto::class.java)
        @Suppress("UNCHECKED_CAST")
        val tags = p.nutritionalInfo!!["tags"] as List<*>
        assertEquals(2, tags.size)
    }

}
