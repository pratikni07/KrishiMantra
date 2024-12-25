import 'package:flutter/material.dart';
import 'package:krishi_mantra/screens/LanguageSelectionPage.dart';
import 'package:krishi_mantra/screens/features/company/company_list_screen.dart';
import 'package:krishi_mantra/screens/features/news/NewsPage.dart';
import 'package:krishi_mantra/screens/loginScreen/Repository/login_repo.dart';
import '../screens/loginScreen/bloc/login_bloc.dart';
import '../screens/splash_screen.dart';
import '../screens/homeScreen/home_page.dart';
import '../screens/loginScreen/login_page.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class Routes {
  static const String splash = '/';
  static const String home = '/home';
  static const String login = '/login';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case splash:
        return MaterialPageRoute(builder: (_) => const SplashScreen());
      case home:
        return MaterialPageRoute(builder: (_) => CompanyListScreen());
      // return MaterialPageRoute(builder: (_) => const FarmerHomePage());
      // return MaterialPageRoute(builder: (_) => const LanguageSelectionScreen());
      // return MaterialPageRoute(builder: (_) => const NewsPage());
      case login:
        return MaterialPageRoute(
          builder: (_) => RepositoryProvider(
            create: (context) => LoginRepo(),
            child: BlocProvider(
              create: (context) => LoginBloc(context.read<LoginRepo>()),
              child: const LoginScreen(),
            ),
          ),
        );
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(child: Text('No route defined for ${settings.name}')),
          ),
        );
    }
  }
}
