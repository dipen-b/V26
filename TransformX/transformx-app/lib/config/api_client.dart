import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'constants.dart';

/// Single shared Dio instance for the whole app.
///
/// A bare `Dio()` has no base URL, so every request goes to a relative path and
/// fails, and it sends no Authorization header, so authenticated endpoints
/// reject it. Build clients from here instead of constructing `Dio()` inline.
class ApiClient {
  ApiClient._();

  static final Dio dio = _build();

  static Dio _build() {
    final client = Dio(
      BaseOptions(
        baseUrl: AppConstants.apiBaseUrl,
        connectTimeout: AppConstants.apiTimeout,
        receiveTimeout: AppConstants.apiTimeout,
        sendTimeout: AppConstants.apiTimeout,
        contentType: Headers.jsonContentType,
      ),
    );

    client.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final prefs = await SharedPreferences.getInstance();
          final token = prefs.getString(AppConstants.accessTokenKey);
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
      ),
    );

    return client;
  }
}
