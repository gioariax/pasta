import { DatePicker as ChakraDatePicker } from "@chakra-ui/react"
import * as React from "react"
import { LuCalendar } from "react-icons/lu"

export interface DatePickerProps extends ChakraDatePicker.RootProps { }

export const DatePickerRoot = React.forwardRef<
    HTMLDivElement,
    DatePickerProps
>(function DatePicker(props, ref) {
    const { children, ...rest } = props

    return (
        <ChakraDatePicker.Root ref={ref} variant="outline" {...rest}>
            {children}
            <ChakraDatePicker.Positioner>
                <ChakraDatePicker.Content>
                    <ChakraDatePicker.View view="day">
                        <ChakraDatePicker.Header />
                        <ChakraDatePicker.DayTable />
                    </ChakraDatePicker.View>
                    <ChakraDatePicker.View view="month">
                        <ChakraDatePicker.Header />
                        <ChakraDatePicker.MonthTable />
                    </ChakraDatePicker.View>
                    <ChakraDatePicker.View view="year">
                        <ChakraDatePicker.Header />
                        <ChakraDatePicker.YearTable />
                    </ChakraDatePicker.View>
                </ChakraDatePicker.Content>
            </ChakraDatePicker.Positioner>
        </ChakraDatePicker.Root>
    )
})

export const DatePickerControl = React.forwardRef<
    HTMLDivElement,
    ChakraDatePicker.ControlProps
>(function DatePickerControl(props, ref) {
    const { children, ...rest } = props
    return (
        <ChakraDatePicker.Control ref={ref} {...rest}>
            {children}
            <ChakraDatePicker.IndicatorGroup>
                <ChakraDatePicker.Trigger>
                    <LuCalendar />
                </ChakraDatePicker.Trigger>
            </ChakraDatePicker.IndicatorGroup>
        </ChakraDatePicker.Control>
    )
})

export const DatePickerInput = ChakraDatePicker.Input
export const DatePickerLabel = ChakraDatePicker.Label
