/* eslint-disable */
import { useState, Fragment, useCallback } from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { LoadingButton } from '@mui/lab';
import { Grid } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import storage from './firebase';
import { v4 as uuidv4 } from 'uuid';

export default function ImageUpload({ setImage, image, name = 'image1' }) {
  const [defaultImageUpload, setDefaultImageUpload] = useState(false);
  const [percent, setPercent] = useState(0);
  const [progbar, setprogbar] = useState(false);

  const handleImageAsFile = async (e) => {
    try {
      setDefaultImageUpload(true);
      const image = e.target.files[0];
      const storageRef = ref(storage, `/files/${image.name}${image.lastModifiedDate}`);
      const uploadTask = uploadBytesResumable(storageRef, image);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);

          // update progress
          setPercent(percent);
          if (percent === 100) {
            setTimeout(() => {
              setprogbar(false);
            }, 3000);
          } else if (1 < percent < 99) {
            setprogbar(true);
          } else {
            setprogbar(false);
          }
        },
        (err) => console.log(err),
        () => {
          // download url
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            setImage(url);
          });
        }
      );
    } catch (error) {
      console.error(error);
    } finally {
      setDefaultImageUpload(false);
    }
  };

  const removeImage = () => {
    setImage('');
  };
  return (
    <Grid item xs={12} sm={6} md={6}>
      {defaultImageUpload ? (
        'Uploading...'
      ) : (
        <Fragment>
          <div>
            <label htmlFor={name}>
              <input
                key={uuidv4()}
                style={{ display: 'none' }}
                id={name}
                name={name}
                type="file"
                accept="image/jpeg,image/png, image/webp"
                onChange={(e) => {
                  e.persist();
                  handleImageAsFile(e);
                }}
              />
              <LoadingButton
                sx={{
                  backgroundColor: "#36B37E",
                  fontWeight: 600,
                  letterSpacing: 0,
                  opacity: 1,
                  ":hover": {
                    backgroundColor: "#34E0A1",
                  },
                }}
                color="secondary"
                variant="contained"
                component="span"
                size="small"
                style={{
                  marginBottom: '1rem',
                  marginTop: '1rem',
                }}
              >
                Image upload
              </LoadingButton>
            </label>
          </div>
          <div>{progbar && <LinearProgress variant="determinate" value={percent} />}</div>
          {image && (
            <Grid
              lg={8}
              md={8}
              sm={10}
              xs={8}
              mt={1}
              sx={{
                display: 'contents',
                border: '1px solid #5B5B5B',
                flexDirection: 'column',
                background: 'rgba(0, 0, 0, 0.5)',
                transition: '.5s ease',
                width: '100%',
                height: '100%',
                borderRadius: '0.8rem',
              }}
            >
              <Grid position={'absolute'} ml={1} mt={1}>
                <DeleteOutlineIcon
                  sx={{
                    color: '#5B5B5B',
                    backgroundColor: 'white',
                    fontSize: '1.7rem',
                    borderRadius: '0.4rem',
                  }}
                  onClick={() => removeImage()}
                />
              </Grid>

              <img
                src={image}
                alt="images"
                style={{
                  maxHeight: '190px',
                  borderRadius: '0.8rem',
                }}
              />
            </Grid>
          )}
        </Fragment>
      )}
    </Grid>
  );
}
