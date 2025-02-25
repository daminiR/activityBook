import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import React, { forwardRef, Ref, useImperativeHandle, useRef } from "react";
import { TouchableOpacity, View, ViewStyle, TouchableOpacityProps, TextStyle, StyleProp} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "../theme";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { ListItem } from "./ListItem";
import { TextField, TextFieldProps } from "./TextField";
import { isRTL, translate, TxKeyPath } from "../i18n"
import { Text, TextProps } from "./Text"
import i18n from "i18n-js"

export interface SelectFieldProps extends TouchableOpacityProps {
//export interface SelectFieldProps extends Omit<TextFieldProps, "ref" | "onValueChange" | "onChange" | "value"> {
  value?: string[]
  renderValue?: (value: string[]) => string
  onSelect?: (newValue: string[]) => void
  multiple?: boolean
  textStyle?: StyleProp<TextStyle>
  containerStyle?: StyleProp<ViewStyle>
  txOptions?: i18n.TranslateOptions
  tx?: TextProps["tx"]
}
export interface SelectFieldRef {
  presentOptions: () => void;
  dismissOptions: () => void;
}

function without<T>(array: T[], value: T) {
  return array.filter((v) => v !== value);
}

/**
 * A styled row component that can be used in FlatList, SectionList, or by itself.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/components/ListItem/}
 * @param {SelectFieldProps} props - The props for the `ListItem` component.
 * @returns {JSX.Element} The rendered `ListItem` component.
 */
export const SelectField = forwardRef(function SelectField(
  props: SelectFieldProps,
  ref: Ref<SelectFieldRef>
) {

  const {
    value = [],
    onSelect,
    renderValue,
    tx,
    txOptions,
    multiple = true,
    textStyle: $textStyleOverride,
    containerStyle: $containerStyleOverride,
    //...TouchableOpacityProps,
    ...TextFieldProps
  } = props;
  const sheet = useRef<BottomSheetModal>(null);
  const { bottom } = useSafeAreaInsets();

  const i18nText = tx && translate(tx, txOptions)

  const disabled =
    TextFieldProps.editable === false || TextFieldProps.status === "disabled";

  useImperativeHandle(ref, () => ({ presentOptions, dismissOptions }));

  const valueString =
    renderValue?.(value) ??
    value
      .map((v) => i18nText.find((o) => o.value === v)?.label)
      .filter(Boolean)
      .join(", ");

  function presentOptions() {
    if (disabled) return;

    sheet.current?.present();
  }

  function dismissOptions() {
    sheet.current?.dismiss();
  }

  function updateValue(optionValue: string) {
    if (value.includes(optionValue)) {
      onSelect?.(multiple ? without(value, optionValue) : []);
    } else {
      onSelect?.(multiple ? [...value, optionValue] : [optionValue]);
      if (!multiple) dismissOptions();
    }
  }

  return (
    <>
      <TouchableOpacity activeOpacity={1} onPress={presentOptions}>
        <View style={{marginBottom: spacing.lg}} pointerEvents="none">
          <TextField
            {...TextFieldProps}
            value={valueString}
            RightAccessory={(props) => <Icon icon="caretRight" containerStyle={props.style} />}
            style={$helperStyle}
          />
        </View>
      </TouchableOpacity>

      <BottomSheetModal
        ref={sheet}
        snapPoints={["50%"]}
        stackBehavior="replace"
        enableDismissOnClose
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
        )}
        footerComponent={
          !multiple
            ? undefined
            : (props) => (
                <BottomSheetFooter {...props} style={$bottomSheetFooter} bottomInset={bottom}>
                  <Button text="Dismiss" preset="reversed" onPress={dismissOptions} />
                </BottomSheetFooter>
              )
        }
      >
        <BottomSheetFlatList
          style={{ marginBottom: bottom + (multiple ? 56 : 0) }}
          data={i18nText}
          keyExtractor={(o) => o.value}
          renderItem={({ item, index }) => (
            <ListItem
              text={item.label}
              topSeparator={index !== 0}
              style={$listItem}
              rightIcon={value.includes(item.value) ? "check" : undefined}
              rightIconColor={colors.palette.angry500}
              onPress={() => updateValue(item.value)}
            />
          )}
        />
      </BottomSheetModal>
    </>
  )
})

const $bottomSheetFooter: ViewStyle = {
  paddingHorizontal: spacing.lg,
};

const $listItem: ViewStyle = {
  paddingHorizontal: spacing.lg,
};

const $helperStyle: TextStyle = {
  marginTop: spacing.xs,
}


