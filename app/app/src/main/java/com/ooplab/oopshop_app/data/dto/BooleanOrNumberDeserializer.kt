package com.ooplab.oopshop_app.data.dto

import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import java.lang.reflect.Type

/**
 * Backend may return a boolean field as true/false or as 1/0 (number).
 * This deserializer accepts both.
 */
class BooleanOrNumberDeserializer : JsonDeserializer<Boolean?> {

    override fun deserialize(
        json: JsonElement,
        typeOfT: Type,
        context: JsonDeserializationContext
    ): Boolean? {
        if (json.isJsonNull || !json.isJsonPrimitive) return null
        val prim = json.asJsonPrimitive
        return when {
            prim.isBoolean -> prim.asBoolean
            prim.isNumber -> prim.asInt != 0
            else -> null
        }
    }
}
