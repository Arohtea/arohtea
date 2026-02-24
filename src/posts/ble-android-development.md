---
title: "Android BLE 开发：从扫描到数据收发全部流程"
excerpt: "蓝牙低功耗（BLE）开发充满了权限陷阱和异步回调。这篇文章带你理清整个通信流程，少走弯路。"
date: "2026-01-20"
category: "Tech"
id: "ble-android-development"
---

# Android BLE 开发：从扫描到数据收发全流程

如果你曾经尝试过 Android BLE 开发，大概率被各种权限声明、回调地狱和设备兼容问题折磨过。这篇文章把整个流程梳理清楚，从扫描设备、建立连接，到读写 Characteristic，一步到位。

## 准备工作：权限声明

Android 12 以后，BLE 相关权限经历了一次重大调整：

```xml
<!-- AndroidManifest.xml -->
<!-- Android 12+ -->
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<!-- Android 11 及以下 -->
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

> 注意：扫描 BLE 设备在 Android 11 及以下系统中需要位置权限，因为 BLE 扫描可能泄露用户位置，这是 Google 的安全策略。

## 扫描设备

```kotlin
private val scanner = BluetoothAdapter.getDefaultAdapter().bluetoothLeScanner

private val scanCallback = object : ScanCallback() {
    override fun onScanResult(callbackType: Int, result: ScanResult) {
        val device = result.device
        Log.d("BLE", "发现设备: ${device.name} [${device.address}]")
    }
}

fun startScan() {
    val filters = listOf(ScanFilter.Builder().setDeviceName("MyDevice").build())
    val settings = ScanSettings.Builder()
        .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
        .build()
    scanner.startScan(filters, settings, scanCallback)
}
```

## 连接与 GATT 通信

找到目标设备后，通过 `connectGatt` 建立连接：

```kotlin
val gatt = device.connectGatt(context, false, object : BluetoothGattCallback() {
    override fun onConnectionStateChange(gatt: BluetoothGatt, status: Int, newState: Int) {
        if (newState == BluetoothProfile.STATE_CONNECTED) {
            gatt.discoverServices() // 连接成功后发现服务
        }
    }

    override fun onServicesDiscovered(gatt: BluetoothGatt, status: Int) {
        val characteristic = gatt
            .getService(UUID.fromString("0000FFE0-..."))
            ?.getCharacteristic(UUID.fromString("0000FFE1-..."))

        // 开启通知：设备主动上报数据
        gatt.setCharacteristicNotification(characteristic, true)
    }

    override fun onCharacteristicChanged(gatt: BluetoothGatt, char: BluetoothGattCharacteristic) {
        val data = char.value
        Log.d("BLE", "收到数据: ${data.toHexString()}")
    }
})
```

## 踩坑记录

1. **所有 GATT 操作必须串行执行**：不能同时发起两个读/写请求，必须等上一个回调返回后再发下一个。
2. **UI 线程限制**：BLE 回调运行在子线程，更新 UI 必须切到主线程。
3. **连接超时处理**：始终实现超时逻辑，部分设备在广播期间无法正常连接。

掌握这个流程之后，BLE 调试工具、传感器采集、智能硬件控制都不在话下。
