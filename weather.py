import tkinter as tk
from tkinter import messagebox
import requests

API_KEY = "cdd84496d31e6a4c46b264f7db6a324f"   # <<< PUT YOUR KEY HERE


# ---------------- DRAW GRADIENT BACKGROUND ---------------- #
def draw_gradient(canvas, color1, color2):
    # Vertical gradient based on canvas height
    width = 600
    height = 600

    r1, g1, b1 = canvas.winfo_rgb(color1)
    r2, g2, b2 = canvas.winfo_rgb(color2)

    r_ratio = (r2 - r1) / height
    g_ratio = (g2 - g1) / height
    b_ratio = (b2 - b1) / height

    for i in range(height):
        nr = int(r1 + (r_ratio * i))
        ng = int(g1 + (g_ratio * i))
        nb = int(b1 + (b_ratio * i))

        color = f"#{nr//256:02x}{ng//256:02x}{nb//256:02x}"
        canvas.create_line(0, i, width, i, fill=color)


# ---------------- WEATHER FETCHING ---------------- #
def get_weather():
    city = city_entry.get()

    if not city:
        messagebox.showerror("Error", "Please enter a city name.")
        return

    # Current weather
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
    # 5-day / 3-hour forecast
    forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}&units=metric"

    try:
        # Current weather call
        response = requests.get(url)
        data = response.json()

        if data.get("cod") != 200:
            messagebox.showerror("Error", data.get("message", "Unknown error"))
            return

        temp = data["main"]["temp"]
        description = data["weather"][0]["description"].title()
        humidity = data["main"]["humidity"]

        current_weather_label.config(
            text=f"Temperature: {temp}°C\n"
                 f"Condition: {description}\n"
                 f"Humidity: {humidity}%"
        )

        # 5-Day Forecast Call
        f_res = requests.get(forecast_url)
        f_data = f_res.json()

        forecast_list = f_data["list"]

        # Choose one forecast per day (12:00 PM entries)
        daily = {}
        for entry in forecast_list:
            if "12:00:00" in entry["dt_txt"]:
                date = entry["dt_txt"].split(" ")[0]
                temp = entry["main"]["temp"]
                desc = entry["weather"][0]["description"].title()
                daily[date] = (temp, desc)

        # Build the printable forecast
        forecast_text = ""
        for day, (t, d) in daily.items():
            forecast_text += f"{day}: {t}°C | {d}\n"

        weekly_label.config(text=forecast_text)

    except Exception as e:
        messagebox.showerror("Error", str(e))


# ---------------- GUI SETUP ---------------- #
root = tk.Tk()
root.title("Weather App")
root.geometry("600x600")
root.resizable(False, False)

# Canvas for gradient
canvas = tk.Canvas(root, width=600, height=600, highlightthickness=0)
canvas.pack(fill="both", expand=True)

# Blue → Yellow gradient
draw_gradient(canvas, "#009dff", "#ffe066")

# Container frame so elements float above gradient
frame = tk.Frame(root, bg="#ffffff", bd=0)
frame.place(relx=0.5, rely=0.08, anchor="n")

title_label = tk.Label(
    canvas,
    text="Weather Checker",
    font=("Arial", 22, "bold"),
    bg="#ffffff",
    fg="black"
)
title_label.place(relx=0.5, rely=0.05, anchor="center")

city_entry = tk.Entry(root, font=("Arial", 16), justify="center", width=20)
city_entry.place(relx=0.5, rely=0.15, anchor="center")

search_button = tk.Button(
    root,
    text="Get Weather",
    font=("Arial", 14, "bold"),
    bg="#0077ff",
    fg="white",
    activebackground="#005fcc",
    width=15,
    command=get_weather
)
search_button.place(relx=0.5, rely=0.22, anchor="center")

# Slot for animated image (optional GIF)
gif_label = tk.Label(root, bg="#ffffff")
gif_label.place(relx=0.5, rely=0.33, anchor="center")
# (You can load a gif using: gif = tk.PhotoImage(file="your.gif"); gif_label.config(image=gif))


# Current weather section
current_weather_label = tk.Label(
    root,
    text="",
    font=("Arial", 14),
    bg="#ffffff",
    fg="black",
    justify="center"
)
current_weather_label.place(relx=0.5, rely=0.50, anchor="center")

# Weekly forecast
weekly_label = tk.Label(
    root,
    text="",
    font=("Arial", 12),
    bg="#ffffff",
    fg="black",
    justify="left"
)
weekly_label.place(relx=0.5, rely=0.75, anchor="center")

root.mainloop()
