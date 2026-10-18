export function bindPickerSessionEvents(sessionOptions) {
  sessionOptions.forEach((option) =>
    option.addEventListener("change", () => {
      sessionOptions.forEach((other) => {
        other.checked = option.checked;
      });
    }),
  );
}
