import { useState, Fragment } from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { LoadingButton } from '@mui/lab';
import { Grid } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import storage from './firebase';
import { v4 as uuidv4 } from 'uuid';

export default function FileUpload({ setFile, file, name = 'file1' }) {
  const [defaultFileUpload, setDefaultFileUpload] = useState(false);
  const [percent, setPercent] = useState(0);
  const [progbar, setProgbar] = useState(false);

  const handleFileAsFile = async (e) => {
    try {
      setDefaultFileUpload(true);

      const selectedFiles = Array.from(e.target.files).slice(0, 10); // Limits to 10 files

      const uploadPromises = selectedFiles.map((file) => {
        const storageRef = ref(storage, `/files/${file.name}${file.lastModifiedDate}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);

              // Update progress for each file (optional: you can track progress per file)
              setPercent((prevPercent) => ({
                ...prevPercent,
                [file.name]: percent,
              }));

              if (percent === 100) {
                setTimeout(() => {
                  setProgbar(false); // Set progress bar state based on your requirement
                }, 3000);
              } else if (percent > 1 && percent < 99) {
                setProgbar(true);
              } else {
                setProgbar(false);
              }
            },
            (err) => reject(err),
            () => {
              // Get download URL once upload is complete
              getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                resolve(url);
              });
            }
          );
        });
      });

      // Wait for all uploads to finish and collect the download URLs
      const fileUrls = await Promise.all(uploadPromises);
      console.log('fileUrls', fileUrls);
      setFile(fileUrls); // Set the file URLs after all uploads complete
    } catch (error) {
      console.error(error);
    } finally {
      setDefaultFileUpload(false);
    }
  };

  const removeFile = (i) => {
    setFile('');
  };

  return (
    <Grid container item xs={12}>
      {defaultFileUpload ? (
        'Uploading...'
      ) : (
        <Fragment>
          <div>
            <Grid
              item
              xs={12}
              sx={{
                marginTop: 1,
                width: '100%',
              }}
            >
              <label htmlFor={name}>
                <input
                  key={uuidv4()}
                  style={{ display: 'none' }}
                  id={name}
                  name={name}
                  type="file"
                  multiple
                  accept="*/*" // Accepts all file types; modify as needed (e.g., "application/pdf,image/jpeg" for specific types)
                  onChange={(e) => {
                    e.persist();
                    handleFileAsFile(e);
                  }}
                />
                <LoadingButton
                  sx={{
                    backgroundColor: '#36B37E',
                    fontWeight: 600,
                    letterSpacing: 0,
                    opacity: 1,
                    ':hover': {
                      backgroundColor: '#34E0A1',
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
                  File Upload
                </LoadingButton>
              </label>
            </Grid>
          </div>
          <div>{progbar && <LinearProgress variant="determinate" value={percent} />}</div>
            <Grid
              container
            item
            xs={12}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignContent:"flex-start",
              marginTop: 1,
            }}
          >
            {' '}
            {file.map((item) => {
              return (
                <Grid
                  item
                  xs={6}
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
                      onClick={() => removeFile(item)}
                    />
                  </Grid>
                  <iframe
                    src={item}
                    style={{
                      maxHeight: '190px',
                      borderRadius: '0.8rem',
                      margin: '5px',
                    }}
                    title="Report"
                  />
                </Grid>
              );
            })}
          </Grid>
        </Fragment>
      )}
    </Grid>
  );
}
