# TransformX - Mobile App

Premium Body Transformation Ecosystem app for iOS and Android built with Flutter.

## Tech Stack

- **Framework**: Flutter 3.13+
- **State Management**: Riverpod
- **Navigation**: GoRouter
- **UI Components**: Material Design 3 + Custom Glassmorphism
- **API Client**: Dio
- **Local Storage**: Hive, GetStorage, SharedPreferences
- **Firebase**: Auth, Storage, Messaging, Analytics
- **Ads**: Google Mobile Ads
- **In-App Purchases**: RevenueCat, In App Purchase
- **Charts**: FL Chart, Syncfusion Charts
- **Animations**: Lottie

## Project Structure

```
lib/
├── main.dart                 # App entry point
├── config/
│   ├── theme.dart           # Glassmorphism design system
│   ├── routes.dart          # GoRouter navigation
│   └── constants.dart       # App constants
├── models/                   # Data models
├── screens/                  # UI Screens
│   ├── auth/
│   ├── dashboard/
│   ├── challenges/
│   ├── transformations/
│   ├── analytics/
│   ├── community/
│   ├── nutrition/
│   └── profile/
├── services/                 # Business logic
│   ├── api_service.dart
│   ├── auth_service.dart
│   ├── ad_service.dart
│   └── ...
├── providers/               # Riverpod state management
├── widgets/                 # Reusable UI components
└── utils/                   # Helper utilities
```

## Getting Started

### Prerequisites

- Flutter SDK 3.13.0 or higher
- Dart SDK 3.0.0 or higher
- Xcode 14+ (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Install Flutter**
   Follow [Flutter installation guide](https://flutter.dev/docs/get-started/install)

2. **Get dependencies**
   ```bash
   cd transformx-app
   flutter pub get
   ```

3. **Configure Firebase**
   - Add google-services.json for Android
   - Add GoogleService-Info.plist for iOS
   - Follow [Firebase setup guide](https://firebase.google.com/docs/flutter/setup)

4. **Configure AdMob**
   - Add your AdMob App ID and Ad Unit IDs
   - Update in lib/config/constants.dart

5. **Configure RevenueCat**
   - Set your API key in environment configuration

### Running the App

**iOS:**
```bash
flutter run -d iPhone
```

**Android:**
```bash
flutter run -d Android
```

**Web (future):**
```bash
flutter run -d web
```

## Key Features

### Dashboard
- Current weight and goal tracking
- Daily challenges
- Water and step trackers
- Progress ring animations
- Native ads for free users

### Challenges
- Browse available challenges
- Join 30-day, 90-day, specialty challenges
- Track progress in real-time
- Earn achievement badges

### Transformation Tracking
- Upload before/after photos
- Weekly progress photos
- Timeline view
- AI progress insights

### Analytics
- Weight progress charts
- Calorie tracking
- Water intake analysis
- Step count visualizations
- AI-generated insights

### Community
- Global leaderboard
- Friends leaderboard
- Achievement badges
- Social sharing

### Nutrition (Premium)
- AI-powered meal plans
- Personalized nutrition guidance
- Food analysis

## Design System

### Colors
- **Primary**: Indigo #4F46E5
- **Secondary**: Purple #7C3AED
- **Accent**: Emerald #10B981
- **Warning**: Amber #F59E0B
- **Background**: Dark #0F172A
- **Card**: Dark Slate #1E293B

### Glassmorphism
- Semi-transparent cards with blur effect
- Smooth animations (300ms default)
- Subtle gradients
- Border with opacity

### Typography
- **Headlines**: Poppins Bold
- **Body**: Inter Regular
- **Small**: Inter Regular 12px

## State Management with Riverpod

```dart
// Example: User Provider
final userProvider = FutureProvider<User>((ref) async {
  final apiService = ref.watch(apiServiceProvider);
  return apiService.getUser();
});

// Usage in Widget
class MyWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);
    return user.when(
      data: (user) => Text(user.fullName),
      loading: () => Skeleton(),
      error: (error, stack) => ErrorWidget(),
    );
  }
}
```

## Navigation

Using GoRouter for declarative routing:

```dart
context.go('/challenges');
context.push('/challenge/123');
context.pop();
```

## Services

### API Service
- Dio HTTP client with interceptors
- JWT token management
- Error handling
- Request/Response logging

### Auth Service
- Registration and login
- Token refresh
- Password reset
- Social authentication (Google)

### Ad Service
- Google Mobile Ads integration
- Banner ads
- Native ads
- Rewarded video ads
- Ad consent management

### Subscription Service
- RevenueCat integration
- Plan management
- Purchase handling
- Subscription status

## Testing

```bash
# Run all tests
flutter test

# Run tests with coverage
flutter test --coverage

# Run specific test file
flutter test test/services/auth_service_test.dart
```

## Build & Deploy

### iOS App Store
```bash
flutter build ios --release
# Follow Xcode archive and upload steps
```

### Android Google Play
```bash
flutter build appbundle --release
# Upload to Google Play Console
```

## Performance Tips

1. Use `const` constructors for widgets
2. Implement `shouldRebuild` in providers
3. Use `select()` for watching specific values
4. Lazy load images with `cached_network_image`
5. Use skeleton loaders for better UX
6. Implement pagination for long lists

## Debugging

Enable debug mode:
```bash
flutter run --debug
```

Use DevTools:
```bash
flutter pub global activate devtools
devtools
```

## Troubleshooting

### Build Issues
```bash
flutter clean
flutter pub get
flutter pub upgrade
```

### iOS Pods Issues
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Firebase Issues
- Ensure google-services.json and GoogleService-Info.plist are properly configured
- Check Firebase Console for app registration

## Contributing

1. Create a feature branch
2. Follow Flutter style guide
3. Write tests for new features
4. Submit pull request

## Resources

- [Flutter Docs](https://flutter.dev/docs)
- [Riverpod Docs](https://riverpod.dev)
- [Material 3 Design](https://m3.material.io)
- [Firebase Flutter](https://firebase.google.com/docs/flutter)

## Future Enhancements

Phase 2 & 3 features:
- Real-time leaderboard with WebSocket
- Advanced AI insights
- Wearable device integration
- Social challenge groups
- In-app messaging
- Advanced analytics dashboard

## License

Copyright © 2024 TransformX. All rights reserved.
