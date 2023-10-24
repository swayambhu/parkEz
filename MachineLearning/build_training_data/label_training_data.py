import cv2
import numpy as np
import os
import json
import argparse
from datetime import datetime
from PIL import Image, ImageTk
import tkinter as tk

def process_time(filename):
    date_str = filename.split('_')[1].split('.jpg')[0]
    ret = {}
    ret['year'] = int(date_str[0:4])
    ret['month'] = int(date_str[4:6])
    ret['day'] = int(date_str[6:8])
    ret['hour'] = int(date_str[8:10])
    ret['min'] = int(date_str[10:12])

    # Makes a human readable time accessible through returned dictionary
    human_time = ''
    if ret['hour'] == 0 : human_time = '12'
    elif ret['hour'] > 12 : human_time = "{:02d}".format(ret['hour'] - 12)
    else : human_time = "{:02d}".format(ret['hour'])
    human_time = human_time + ':' +  "{:02d}".format(ret['min'])
    if ret['hour'] > 12 : human_time = human_time + 'pm'
    else : human_time = human_time + 'am'
    ret['human_time'] = human_time

    # A string so a programmer can see all data clearly
    return "{:02d}".format(ret['month']) + '/' + "{:02d}".format(ret['day']) + '/' +  str(ret['year']) + ' ' + human_time
    
class ImageLoader:
    def __init__(self, folder, parking_spots):
        self.images = sorted([img for img in os.listdir(folder) if img.endswith(".jpg")])
        self.index = 0
        self.folder = folder
        self.parking_spots = parking_spots
        self.load_labels()
    
    def load_image(self):
        filepath = os.path.join(self.folder, self.images[self.index])
        image = cv2.imread(filepath)
        these_spots = self.labels[self.images[self.index]]
        height, width, channels = image.shape
        cv2.rectangle(image, (width // 2 - 450, 0), (width // 2 + 600, 50+10), (255,255,255), -1)
        cv2.putText(image, process_time(self.images[self.index]) + ' ' + "{:03d}".format(self.index + 1) + '/' + "{:03d}".format(len(self.images)), (width // 2 - 450, 50), cv2.FONT_HERSHEY_SIMPLEX, 2, (0,0,0),3)
        for key in these_spots.keys():
            spot_coords = self.parking_spots[key]
            x_spot, x_spot_w, y_spot, y_spot_h = spot_coords
            color = (255, 255, 255) if these_spots[key] else (255, 0, 0)
            cv2.rectangle(image, (x_spot, y_spot), (x_spot_w, y_spot_h), color, 2)
            cv2.putText(image, f'Spot {key}', (x_spot, y_spot-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)
            
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        return Image.fromarray(image)

    
    def mark_spot(self, image, all_buttons):
        height, width, channels = image.shape
        cv2.rectangle(image, (width // 2 - 450, 0), (width // 2 + 600, 50+10), (255,255,255), -1)
        cv2.putText(image, process_time(self.images[self.index]) + ' ' + "{:03d}".format(self.index + 1) + '/' + "{:03d}".format(len(self.images)), (width // 2 - 450, 50), cv2.FONT_HERSHEY_SIMPLEX, 2, (0,0,0),3)

        for key in all_buttons.keys():
            spot_coords = self.parking_spots[key]
            x_spot, x_spot_w, y_spot, y_spot_h = spot_coords
            color = (255, 255, 255) if bool(all_buttons[key].get()) else (255, 0, 0)
            cv2.rectangle(image, (x_spot, y_spot), (x_spot_w, y_spot_h), color, 2)
            cv2.putText(image, f'Spot {key}', (x_spot, y_spot-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)
            
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        return Image.fromarray(image)

    def load_labels(self):
        labels_filepath = os.path.join(self.folder, 'labels.json')
        if os.path.exists(labels_filepath):
            with open(labels_filepath, 'r') as f:
                self.labels = json.load(f)
        else:
            self.labels = {
                image: {spot: False for spot in self.parking_spots.keys()}
                for image in self.images
            }
            with open(labels_filepath, 'w') as f:
                json.dump(self.labels, f)

    def save_labels(self):
        labels_filepath = os.path.join(self.folder, 'labels.json')
        with open(labels_filepath, 'w') as f:
            json.dump(self.labels, f)


    def next_image(self):
        if self.index < len(self.images) - 1:
            self.index += 1
            return self.load_image()
        else:
            return None

    def prev_image(self):
        if self.index > 0:
            self.index -= 1
            return self.load_image()
        else:
            return None

class ImageViewer:
    def __init__(self, folder, parking_spots):
        self.window = tk.Tk()
        self.loader = ImageLoader(folder, parking_spots)
        self.canvas = tk.Label(self.window)
        self.canvas.pack()

        button_frame = tk.Frame(self.window)
        button_frame.pack(side=tk.BOTTOM, fill=tk.X)

        self.prev_button = tk.Button(button_frame, text="Previous", command=self.show_prev, padx=10, pady=10, font=('Arial', 16))
        self.prev_button.pack(side=tk.LEFT)

        self.next_button = tk.Button(button_frame, text="Next", command=self.show_next, padx=10, pady=10, font=('Arial', 16))
        self.next_button.pack(side=tk.LEFT)

        self.copy_prev_button = tk.Button(button_frame, text="Prev Label", command=self.copy_prev_labels, padx=10, pady=10, font=('Arial', 16))
        self.copy_prev_button.pack(side=tk.RIGHT)

        self.checkbuttons = {}
        checkbox_frame = tk.Frame(self.window)
        checkbox_frame.pack(side=tk.BOTTOM, fill=tk.X)

        for i, spot in enumerate(parking_spots, 1):
            var = tk.IntVar()  # This variable tracks whether the checkbox is selected or not
            checkbox = tk.Checkbutton(checkbox_frame, text=spot, variable=var, font=('Arial', 16), command=lambda: self.update_image())
            checkbox.pack(side=tk.LEFT)
            self.checkbuttons[spot] = var
            self.window.bind(str(i), self.create_checkbutton_toggle_callback(var))

        self.load_labels()
        self.check_buttons()

        self.show_image(self.loader.load_image())
        self.window.bind('<Left>', lambda e: self.show_prev())
        self.window.bind('<Right>', lambda e: self.show_next())
        self.window.bind('z', lambda e: self.copy_prev_labels())


    
    def update_image(self):
        image = cv2.imread(os.path.join(self.loader.folder, self.loader.images[self.loader.index]))
        image = self.loader.mark_spot(image, self.checkbuttons)
        self.save_labels()
        self.show_image(image)



    def create_checkbutton_toggle_callback(self, var):
        def callback(event):
            var.set(1 - var.get())  # Toggle between 0 and 1
            self.update_image()
        return callback
    
    def show_image(self, image):
        self.image_tk = ImageTk.PhotoImage(image)
        self.canvas.config(image=self.image_tk)

    def show_next(self):
        image = self.loader.next_image()
        if image is not None:
            self.show_image(image)
            self.load_labels()
        self.check_buttons()

    def show_prev(self):
        image = self.loader.prev_image()
        if image is not None:
            self.show_image(image)
            self.load_labels()
        self.check_buttons()


    def check_buttons(self):
        self.next_button.config(state=tk.NORMAL if self.loader.index < len(self.loader.images) - 1 else tk.DISABLED)
        self.prev_button.config(state=tk.NORMAL if self.loader.index > 0 else tk.DISABLED)

    def run(self):
        self.window.mainloop()

    def save_labels(self):
        labels = {spot: bool(var.get()) for spot, var in self.checkbuttons.items()}
        self.loader.labels[self.loader.images[self.loader.index]] = labels
        self.loader.save_labels()

    def load_labels(self):
        labels = self.loader.labels[self.loader.images[self.loader.index]]
        for spot, label in labels.items():
            self.checkbuttons[spot].set(label)

    def copy_prev_labels(self):
        if self.loader.index > 0:
            prev_labels = self.loader.labels[self.loader.images[self.loader.index - 1]]
            for spot, label in prev_labels.items():
                self.checkbuttons[spot].set(label)
            self.update_image()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Parking lot analyzer')
    parser.add_argument('folder', type=str, help='Folder containing the images')
    parser.add_argument('lot_configuration', type=str, help='JSON file containing parking lot configuration')

    args = parser.parse_args()

    input_folder = args.folder
    output_folder = './examples/output/'
    input_files = sorted([f for f in os.listdir(input_folder) if os.path.isfile(os.path.join(input_folder, f))])

    with open(args.lot_configuration, 'r') as f:
        parking_spots = json.load(f)

    viewer = ImageViewer(args.folder, parking_spots)
    viewer.run()