package com.ooplab.oopshop_app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.ooplab.oopshop_app.data.dto.InvoiceListItemDto
import com.ooplab.oopshop_app.data.dto.ReportDto
import com.ooplab.oopshop_app.data.network.RetrofitClient
import com.ooplab.oopshop_app.data.repository.Resource
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * ViewModel for admin panel: reports and all invoices (manager only).
 */
class AdminViewModel(application: Application) : AndroidViewModel(application) {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    private val _report = MutableLiveData<Resource<ReportDto>>()
    val report: LiveData<Resource<ReportDto>> = _report

    private val _allInvoices = MutableLiveData<Resource<List<InvoiceListItemDto>>>()
    val allInvoices: LiveData<Resource<List<InvoiceListItemDto>>> = _allInvoices

    fun loadReport(from: String? = null, to: String? = null) {
        _report.value = Resource.Loading
        scope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    RetrofitClient.reportsApi.getReport(from = from, to = to)
                }
                when {
                    response.isSuccessful -> {
                        val body = response.body()
                        when {
                            body != null && body.isSuccess() && body.data != null ->
                                _report.value = Resource.Success(body.data)
                            body != null -> _report.value = Resource.Error(body.message ?: "Request failed")
                            else -> _report.value = Resource.Error("Empty response")
                        }
                    }
                    else -> _report.value = Resource.Error("${response.code()}: ${response.message()}")
                }
            } catch (e: Exception) {
                _report.value = Resource.Error(e.message ?: "Failed to load report", e)
            }
        }
    }

    fun loadAllInvoices() {
        _allInvoices.value = Resource.Loading
        scope.launch {
            try {
                val response = withContext(Dispatchers.IO) { RetrofitClient.invoicesApi.getAllInvoices() }
                when {
                    response.isSuccessful -> {
                        val body = response.body()
                        when {
                            body != null && body.isSuccess() ->
                                _allInvoices.value = Resource.Success(body.data ?: emptyList())
                            body != null -> _allInvoices.value = Resource.Error(body.message ?: "Request failed")
                            else -> _allInvoices.value = Resource.Error("Empty response")
                        }
                    }
                    else -> _allInvoices.value = Resource.Error("${response.code()}: ${response.message()}")
                }
            } catch (e: Exception) {
                _allInvoices.value = Resource.Error(e.message ?: "Failed to load invoices", e)
            }
        }
    }
}
