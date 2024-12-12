import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:krishi_doctor/Login/bloc/login_bloc.dart';


class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  @override
  Widget build(BuildContext context) {
    return BlocConsumer<LoginBloc,LoginState>(
        listener: (context, state){

        },

        builder: (context, state){
      return Scaffold(
        body: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SizedBox(
                height: MediaQuery.of(context).size.height * 0.1,
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Image.asset('assets/Images/Logo.png', height: 200, width: 200,),
                ],
              ),
              SizedBox(
                height: MediaQuery.of(context).size.height * 0.01,
              ),
              const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Enter Your Mobile Number', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),),
                ],
              ),
              
              const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('We will send you a One Time Password'),
                ],
              ),
              SizedBox(
                height: MediaQuery.of(context).size.height * 0.05,
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: MediaQuery.of(context).size.width * 0.8,
                    child: TextField(
                      decoration: InputDecoration(
                        hintText: 'Enter Your Mobile Number',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(
                height: MediaQuery.of(context).size.height * 0.05,
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: MediaQuery.of(context).size.width * 0.8,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: (){

                      },
                      child: const Text('Send OTP'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        )
      );
    });
  }
}
