import React, { useCallback, useEffect, useRef, useState } from "react";
import moment from "moment";
import { createUseStyles, ThemeProvider } from 'react-jss';
import datePickerTheme from "../styles/datePickerTheme";

import CalendarIcon from "../components/CalendarIcon";
import MonthPicker from "../components/MonthPicker";
import DaysHeading from "../components/DaysHeading";
import DatesOfMonth from "../components/DatesOfMonth";
import keyDownHandler from "../utility/keyDownHandler";
import onChangeHandler from "../utility/onChangeHandler";

interface IDatePickerProps {
  applicationMode?: boolean;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  dateFormat: string;
  validation: boolean;
  theme?: IDatePickerTheme;
}

export interface IDatePickerTheme {
  palette: {
    primary: string,
    secondary: string,
    tertiary: string,
  },
  spacing: string[],
}

export interface IDatePickerThemeOptions {
  palette?: {
    primary?: string,
    secondary?: string,
    tertiary?: string,
  },
  spacing?: string[],
}

interface IClickedDate {
  date?: number;
  month?: number;
  year?: number;
}

interface IDateObject {
  year: number;
  month: number;
  dates: number;
}

interface IIsClicked {
  buttonId: string,
  selected: boolean
}

export const createDatePickerTheme = (options: IDatePickerThemeOptions): IDatePickerTheme => {
  return {
    ...datePickerTheme,
    ...options
  } as IDatePickerTheme
}

const DatePicker: React.FC<IDatePickerProps> = (props) => {
  const { value, setValue, dateFormat, validation, theme } = props
  const usedTheme = theme ? theme : datePickerTheme;
  const useStyles = createUseStyles({
    labelDatePicker: {
      fontStyle: "italic",
      fontSize: "smaller",
    },
    inputFieldDatePicker: {
      padding: [usedTheme.spacing[2] + " " + usedTheme.spacing[2] + " " + usedTheme.spacing[2] + " " + usedTheme.spacing[4]],
      textAlign: "left",
    },
    iconButton: {
      background: "none",
      position: "absolute",
      padding: usedTheme.spacing[2],
      border: "none",
      color: usedTheme.palette.secondary && usedTheme.palette.secondary,
      textAlign: "center",
    },
    calendarContainer: {
      backgroundColor: usedTheme.palette.primary && usedTheme.palette.primary,
      display: "inline-block",
      boxSizing: "content-box",
      position: "absolute",
      textAlign: "center",
      borderRadius: usedTheme.spacing[2] && usedTheme.spacing[2],
      boxShadow: '0px 1px 9px 3px rgba(133, 130, 133, 1) ',
      "-webkit-box-shadow": "0px 1px 9px 3px rgba(133, 130, 133, 1)",
      "-moz-box-shadow": "0px 1px 9px 3px rgba(133, 130, 133, 1)",
    },
    calendarTableContainer: {
      boxSizing: "content-box",
      display: "inline-table",
      backgroundColor: usedTheme.palette.primary && usedTheme.palette.primary,
      borderTop: "solid 2px",
      borderTopColor: usedTheme.palette.secondary && usedTheme.palette.secondary,
      borderRadius: [usedTheme.spacing[0] + " " + usedTheme.spacing[0] + " " + usedTheme.spacing[1] + " " + usedTheme.spacing[1]],
      padding: [usedTheme.spacing[3] + " " + usedTheme.spacing[3] + " " + usedTheme.spacing[0] + " " + usedTheme.spacing[3]],
    },
    hiddenCalendar: {
      display: "none"
    }
  });

  const styles = useStyles({ ...props, usedTheme });

  const applicationMode = props.applicationMode ? true : false;
  const focusInput = useRef<HTMLInputElement>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [clickedDate, setClickedDate] = useState<IClickedDate>({});
  const [dateObject, setDateObject] = useState<IDateObject>({
    year: +moment().year(),
    month: +moment().month(),
    dates: +moment().daysInMonth(),
  });
  const [isClicked, setIsClicked] = useState<IIsClicked>({
    buttonId: "",
    selected: false
  });

  useEffect(() => {
    setClickedDate({
      ...clickedDate,
      year: +dateObject.year,
      month: +dateObject.month + 1
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateObject]);

  useEffect(() => {
    const dateInputValueHandler = () => {
      if (clickedDate.date) {
        const selectedFormDateValue = moment(`${clickedDate.year}-${clickedDate.month}-${clickedDate.date}`, "YYYY-MM-DD").format(dateFormat);

        setValue(selectedFormDateValue);
      }
    };
    dateInputValueHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clickedDate]);

  const showCalendarHandler = () => {
    setShowCalendar(!showCalendar);
  };

  const escCalendar = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setShowCalendar(false);
      if (null !== focusInput.current) {
        focusInput.current.focus();
      }
    }
  };

  const onKeyDown = useCallback((event) => { keyDownHandler(event, dateObject.dates, setShowCalendar) }, [dateObject.dates]);
  const applicationKeyHandler = (applicationMode: boolean) => {
    if (applicationMode) {
      window.addEventListener('keydown', onKeyDown);
    }
    else {
      window.removeEventListener('keydown', onKeyDown)
    }
  };

  return (
    <ThemeProvider theme={usedTheme}>
      <div onKeyDown={(e) => escCalendar(e)}>
        <label htmlFor="date-picker-input" className={styles.labelDatePicker} aria-label="enter date in the following format">{dateFormat}</label><br />
        <button className={styles.iconButton} aria-label={showCalendar ? "select to close calendar" : "select to open calendar"} type="button" onClick={showCalendarHandler}>
          <CalendarIcon />
        </button>
        <input ref={focusInput} className={styles.inputFieldDatePicker} id="date-picker-input" type="text" aria-label={value.length > 1 ? "entered date value is" : `enter date in format ${dateFormat}`} autoComplete="off" value={value}
          onChange={(e) => onChangeHandler(e, dateFormat, validation, setValue, setErrorMessage, setClickedDate, setIsClicked)} />
        {errorMessage && <div aria-live="assertive" role="alert"><p style={{ color: "#871111", padding: "4px", margin: "4px" }} >{errorMessage}</p></div>}
      </div>
      <div onKeyDown={(e) => escCalendar(e)} className={showCalendar ? styles.calendarContainer : styles.hiddenCalendar} {...(applicationMode ? { role: "application" } : {})} >
        <MonthPicker
          currentDate={dateObject}
          clickedDate={clickedDate}
          setDateObject={setDateObject} />
        <table id='calendar-table' className={styles.calendarTableContainer} role="presentation" onKeyDown={() => applicationKeyHandler(applicationMode)} >
          <DaysHeading />
          <DatesOfMonth
            applicationMode={applicationMode}
            year={dateObject.year}
            month={dateObject.month}
            datesOfMonth={dateObject.dates}
            setShowCalendar={setShowCalendar}
            isClicked={isClicked}
            setClickedDate={setClickedDate}
            setIsClicked={setIsClicked}
            setErrorMesage={setErrorMessage}
          />
        </table>
      </div>
    </ThemeProvider>
  );
};

export default DatePicker;