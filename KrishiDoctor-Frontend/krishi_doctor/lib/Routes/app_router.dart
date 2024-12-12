import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:krishi_doctor/Login/Repository/login_repo.dart';
import 'package:krishi_doctor/Login/login_screen.dart';
import '../Login/bloc/login_bloc.dart';
import '../Splash/Repository/splashRepo.dart';
import '../Splash/bloc/splash_bloc.dart';
import '../Splash/splash_screen.dart';
class AppRouter{
  Route generateRoute(RouteSettings settings){
    switch(settings.name){
      case '/':
        return MaterialPageRoute(builder: (_)=>RepositoryProvider(
          create: (context)=>SplashRepo(),
          child: BlocProvider(
            create: (context)=>SplashBloc(context.read<SplashRepo>())..add(AuthCheck()),
            child: SplashScreen(),
          ),
        ));
      case '/login':
        return MaterialPageRoute(builder: (_)=>RepositoryProvider(create: (context)=>LoginRepo(),
        child: BlocProvider(
          create: (context)=>LoginBloc(context.read<LoginRepo>()),
          child: LoginScreen(),
        ),
        ));
      default:
        return MaterialPageRoute(builder: (_)=>RepositoryProvider(
          create: (context)=>SplashRepo(),
          child: BlocProvider(
            create: (context)=>SplashBloc(context.read<SplashRepo>())..add(AuthCheck()),
            child: SplashScreen(),
          ),
        ));
    }
  }


}