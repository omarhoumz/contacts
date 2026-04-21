import { Text, View } from "react-native";

export function MobileCard({ label }: { label: string }) {
  return (
    <View style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12 }}>
      <Text>{label}</Text>
    </View>
  );
}
