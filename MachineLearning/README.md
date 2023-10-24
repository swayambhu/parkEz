## model_maker.ipynb generates ML car detection models

Data from build_training_data (both images and labels.json) is used to create .pth model files which ParkEz will use to detect cars in spaces for a specific parking lot camera. One .pth file is used to detect a car per space on the camera (they are binary classifiers).