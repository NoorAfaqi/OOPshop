package com.ooplab.oopshop_app.data.dto

import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import java.lang.reflect.Type

/**
 * Backend may return nutritional_info as a JSON object or as a JSON string
 * (e.g. MySQL JSON column serialized as string). This deserializer accepts both.
 */
class NutritionalInfoDeserializer : JsonDeserializer<Map<String, Any>?> {

    @Suppress("UNCHECKED_CAST")
    override fun deserialize(
        json: JsonElement,
        typeOfT: Type,
        context: JsonDeserializationContext
    ): Map<String, Any>? {
        if (json.isJsonNull) return null
        return when {
            json.isJsonPrimitive && json.asJsonPrimitive.isString -> {
                val str = json.asString
                if (str.isBlank()) return null
                try {
                    parseObject(com.google.gson.JsonParser.parseString(str).asJsonObject)
                } catch (e: Exception) {
                    null
                }
            }
            json.isJsonObject -> parseObject(json.asJsonObject)
            else -> null
        }
    }

    private fun parseObject(obj: JsonObject): Map<String, Any> {
        val map = mutableMapOf<String, Any>()
        for (entry in obj.entrySet()) {
            val v = entry.value
            if (v.isJsonNull) continue
            map[entry.key] = when {
                    v.isJsonPrimitive -> when {
                        v.asJsonPrimitive.isBoolean -> v.asBoolean
                        v.asJsonPrimitive.isNumber -> v.asJsonPrimitive.asNumber
                        else -> v.asString
                    }
                    v.isJsonObject -> parseObject(v.asJsonObject)
                    v.isJsonArray -> v.asJsonArray.map { parseElement(it) }
                    else -> v.asString
                }
        }
        return map
    }

    private fun parseElement(el: JsonElement): Any = when {
        el.isJsonNull -> ""
        el.isJsonPrimitive -> when {
            el.asJsonPrimitive.isBoolean -> el.asBoolean
            el.asJsonPrimitive.isNumber -> el.asJsonPrimitive.asNumber
            else -> el.asString
        }
        el.isJsonObject -> parseObject(el.asJsonObject)
        el.isJsonArray -> el.asJsonArray.map { parseElement(it) }
        else -> el.asString
    }
}
