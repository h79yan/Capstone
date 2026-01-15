import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import BackButton from '../../components/BackButton';

const UserAgreement = () => {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView className="flex-1 bg-white">

        <ScrollView
          className="px-5 pt-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          <BackButton className=" right-[4px]" />

          {/* Title */}
          <Text className="text-4xl font-bold mt-7">Terms &</Text>
          <Text className="text-4xl font-bold mb-3">Conditions</Text>

          {/* Content Sections */}
          <Text className="text-base leading-6 text-gray-700 mb-4">
            Welcome to The Que App. By accessing or using our services, you agree to be bound by
            these Terms & Conditions. Please read them carefully before proceeding.
          </Text>

          {[
            { title: '1) Use of Service', content: 'The Que App connects customers with restaurants for food delivery. You must be at least 18 years old or have legal parental consent to use our services. Misuse, fraudulent activity, or any illegal actions will result in account termination.' },
            { title: '2) Account Registration', content: 'To place an order, you must register an account with accurate and complete information. You are responsible for maintaining the security of your account and must notify us immediately at support@thequeapp.com if you suspect unauthorized access.' },
            { title: '3) Payments & Refunds', content: 'The Que App processes payments securely via third-party providers. By placing an order, you authorize the charge to your selected payment method. Refunds are issued at the discretion of The Que App based on circumstances such as missing or incorrect orders.' },
            { title: '4) Order Cancellations', content: 'Orders may only be canceled within a limited time after placement. Once a restaurant has started preparing your order, cancellations are not permitted. Contact our support team at support@thequeapp.com for any cancellation requests.' },
            { title: '5) Delivery & Liability', content: 'Estimated delivery times are approximate and not guaranteed. The Que App is not responsible for delays due to traffic, weather, or other unforeseen circumstances. If your order arrives significantly late or with missing items, please contact support@thequeapp.com within 24 hours.' },
            { title: '6) User Conduct', content: 'Users must treat restaurant staff and delivery partners with respect. Any harassment, fraud, or violations of our policies may result in immediate account suspension.' },
            { title: '7) Privacy Policy', content: 'We value your privacy. Your personal information is collected and used in accordance with our Privacy Policy. We do not sell user data to third parties. For more details, visit our Privacy Policy page or email privacy@thequeapp.com.' },
            { title: '8) Changes to Terms', content: 'The Que App reserves the right to update these Terms & Conditions at any time. Continued use of our services constitutes acceptance of the revised terms.' },
            { title: '9) Contact Us', content: 'For any questions regarding these Terms & Conditions, please contact us at support@thequeapp.com.' }
          ].map((section, index) => (
            <View key={index} className="mb-4">
              <Text className="text-lg font-semibold mb-1">{section.title}</Text>
              <Text className="text-base leading-6 text-gray-700">{section.content}</Text>
            </View>
          ))}

          {/* Extra Space to Ensure Scrolling */}
          <View className="h-10" />
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default UserAgreement;
