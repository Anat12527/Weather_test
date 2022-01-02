import React, { useEffect, useState } from "react";
import Container from "@material-ui/core/Container";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import FilterListIcon from '@material-ui/icons/FilterList';
import { makeStyles } from "@material-ui/core";
import MyImage from "../assets/Plants.jpg";



const useStyles = makeStyles(() => ({
  table: {
    minWidth: "450",
  },
  container:{
    position: "relative",
    
},
backp:{
  backgroundImage: `url(${MyImage})`,
  backgroundPosition: 'center center',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  height: '100%',
},
 
  wrapTable: {
     marginTop:"10%",
  },
    
  headTable: {
      background:"#f0fff0",
  },

  title: {
      color:"#88b388",
      display:"flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "35px",  
  },
 
}));

const Cities = () => {
  const [cities_data, setCities] = useState(null);
  const [asc_up,setAsc] = useState(true);
  const [open,setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  useEffect(() => {
    fetch("/uploading")
      .then((res) => res.json())
      .then((data_c) => {
        console.log(data_c.data.weather);
        setCities(data_c.data.weather);
      });
  }, []);



  const handleSort =(name_date)=>{
      if(asc_up === true) {
         setAsc(false);
          if (name_date === 'city') { 
             let sortedNames=[...cities_data];
             console.log(sortedNames);
             
             sortedNames.sort((a,b)=>{
              let x =a.city.toUpperCase()
              let y=b.city.toUpperCase()
               
             if(x<y){
                return -1;
             }
             if(x>y){
              return 1;
             }
             return 0;  
          }
            )  
            setCities(sortedNames)  
         } 
         else {
            let sortedDates=[...cities_data];
            
            sortedDates.sort((a,b)=>{
             let x =a.date.toUpperCase()
             let y =b.date.toUpperCase()  
             if(x<y){
              return -1;
            }
            if(x>y){
               return 1;
            }
            return 0; 
            })
            setCities(sortedDates) 
            
         }      
      }
      else {
        setAsc(true);
        if (name_date === 'city') { 
            let sortedNames=[...cities_data];
            sortedNames.sort((a,b)=>{
            let x=a.city.toUpperCase()
            let y=b.city.toUpperCase()  
            if(x<y){
            return 1;
            }
            if(x>y){
             return -1;
            }
            return 0;  
            })  
           setCities(sortedNames)  
        }
         
        else {
            let sortedDates=[...cities_data];
            sortedDates.sort((a,b)=>{
            let x=a.date.toUpperCase()
            let y=b.date.toUpperCase()    
            if(x<y){
              return 1;
            }
            if(x>y){
               return -1;
             }
            return 0; 
            })
            setCities(sortedDates) 
         }      
      }  
     
  }

 
  const classes = useStyles();
  return (
    <React.Fragment>
      <div className={classes.backp}>
      <Container maxWidth="md" className={classes.container}>
          <h1 className={classes.title}>Check Out The Weather</h1>
        <div className={classes.wrapTable}>
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead className={classes.headTable}>
                <TableRow>
                  <TableCell >
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={() => { handleSort('city') }}
                    >
                        <FilterListIcon />
                    </IconButton>


                    City</TableCell>
                  
                  <TableCell align="center"> 
                  <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={() => { handleSort('Date') }}
                    >
                    <FilterListIcon />
                    </IconButton>
                  Date</TableCell>
                  <TableCell align="right">Average Temp C</TableCell>
                  <TableCell align="right">Average Temp F</TableCell>
                  <TableCell align="center">Condition</TableCell>
                  <TableCell align="center"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cities_data ? (
                  cities_data.map((cityData) => (
                    <TableRow >
                      <TableCell component="th" scope="row">
                        {cityData.city}
                      </TableCell>
                      <TableCell align="center">{cityData.date}</TableCell>
                      <TableCell align="center">{cityData.avgtemp_c}</TableCell>
                      <TableCell align="center">{cityData.avgtemp_f}</TableCell>
                      <TableCell align="center">{cityData.condition}</TableCell>
                      <TableCell align="center"><img src={cityData.icon}></img></TableCell>
                    </TableRow>
                  ))
                ) : (
                  <div>No data</div>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
        </div>
      </Container>
      </div>
    </React.Fragment>
  );
  
};
export default Cities;
