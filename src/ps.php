<?php

$type=$_POST["v"]; 

if (!empty($type)) {
  $con = mysql_connect('localhost', 'chodro_kunduz', 'dowhile(9)');
  if (!$con) {
    die('Could not connect: ' . mysql_error());
  }
  mysql_select_db("chodro_kunduz", $con);
  
  switch ($type) { 
    case 'up':
      $email = $_POST["em"];
      $msisdn= $_POST["pn"];
      $uuid  = $_POST["ud"];
      
      $sql="update kuser set email='$email', msisdn='$msisdn' where uuid='$uuid'";
      
      $result = mysql_query($sql);
      if (!$result) {
        die('Error at user select: ' . mysql_error());
      }
      
      $xxx = array(
        "msisdn"   => $msisdn,
        "email"    => $email
      );
        
      header("Content-type: application/json");
      echo json_encode($xxx);
      break;
    case 'c': // updates confirmed state of a follow request
      $id = $_POST["id"];      
      $s  = $_POST["s"];
      $sql= "update follow_request set confirmed='$s' where id='$id'";
      $result = mysql_query($sql);
      if (!$result) {
        die('Error at follow request update: ' . mysql_error());
      }  
      if ($s==1)
        echo "Confirmed.";
      else
        echo "Denied.";
      break;
    case 'u': // unfollow user request 
      $msisdn = substr($_POST["pn"], -10);
      $uuid   = $_POST["ud"];
      
      $sql="select uuid from kuser where msisdn like '%$msisdn' order by id desc";
      $result = mysql_query($sql);
      if (!$result) {
        die('Error at user select: ' . mysql_error());
      }
      $row = mysql_fetch_object($result);
      if (!empty($row)){
        $uuid2unfollow = $row->uuid;
      }
 
      if (empty($uuid2unfollow)) {
        echo "Can't find user..";
      } else {
        $sql="delete from follow_request where uuid1='$uuid' and uuid2='$uuid2unfollow'";
        $result = mysql_query($sql);
        if (!$result) {
          die('Error at user insert: ' . mysql_error());
        } else {
          echo "Deleted from user following list.";
        }
      }

      break;
    case 'fr': // gets follow requests of a user
      $uuid=$_POST["ud"];
      $sql="select follow_request.id, uuid, msisdn, email from kuser, follow_request where follow_request.uuid2='$uuid' and follow_request.uuid1=kuser.uuid and confirmed=0";
      $result = mysql_query($sql);
      if (!$result) {
        die('Error at follow request retrieval: ' . mysql_error());
      }  
      header("Content-type: application/json");
      $i = 0;
      while($row = mysql_fetch_array($result)) {
        $xxx[$i++] = array(
          "id"    => $row['id'],
          "uuid"  => $row['uuid'],
          "msisdn"=> $row['msisdn'],
          "email" => $row['email']);
      }
      echo json_encode($xxx);
      
      break; 
    case 'f': // follow user request
      $msisdn = substr($_POST["pn"], -10);
      $uuid=$_POST["ud"];
      
      $sql="select uuid from kuser where msisdn like '%$msisdn' order by id desc";
      $result = mysql_query($sql);
      if (!$result) {
        die('Error at user select: ' . mysql_error());
      }
   
      $row = mysql_fetch_object($result);
      if (!empty($row)){
        $uuid2follow = $row->uuid;
      }
 
      if (empty($uuid2follow)) {
        echo "Invite user first..";
      } else {
        //echo $msisdn . " - " .$uuid2follow;
        $sql="INSERT INTO follow_request (uuid1, uuid2) VALUES ('$uuid','$uuid2follow')";
        $result = mysql_query($sql);
        if (!$result) {
          die('Error at user insert: ' . mysql_error());
        } else {
          echo "User follow request recorded";
        }
      }
      break;
    case 'r':
      $email = $_POST["em"];
      $msisdn= $_POST["pn"];
      $uuid  = $_POST["ud"];
      
      $sql="select userid from kuser where uuid='$uuid'";
      $result = mysql_query($sql);
      if (!$result) {
        die('Error at user select: ' . mysql_error());
      }
      
      $row = mysql_fetch_object($result);
      if (!empty($row)){
        $userid = $row->userid;
      }      
      if (empty($userid)) {
        $sql="INSERT INTO kuser (userid, uuid, msisdn, email) VALUES ('$uuid$msisdn','$uuid','$msisdn','$email')";
        $result = mysql_query($sql);
        if (!$result) {
          die('Error at user insert: ' . mysql_error());
        }    
        $sql="select userid from kuser where uuid='$uuid'";
        $result = mysql_query($sql);
        if (!$result) {
          die('Error at user select: ' . mysql_error());
        }
        $row = mysql_fetch_object($result);
        if (!empty($row)){
          $userid = $row->userid;
        }
      }
      echo $userid;
      break;
    case 'g': // check if user exists
      $uuid=$_POST["ud"];
      $sql="select userid, msisdn, email from kuser where uuid='$uuid'";
      $result = mysql_query($sql);
      if (!$result) {
        die('Error at user select: ' . mysql_error());
      }
      $row = mysql_fetch_object($result);
      
      if (!empty($row)){
        $xxx = array(
          "userid"   => $row->userid,
          "msisdn"   => $row->msisdn,
          "email"    => $row->email
        );
      } else {
        $xxx = array();
      }
      header("Content-type: application/json");
      echo json_encode($xxx);
      break;
    case 'q': // get positions of users followed
      $uuid=$_POST["ud"];

      $sql="select latitude, longitude, msisdn, email, current_position.created from current_position, follow_request, kuser where uuid1='$uuid' and confirmed=1 and current_position.uuid=uuid2 and kuser.uuid=current_position.uuid";
      $result = mysql_query($sql);
      if (!$result) {
        die('Error at position select: ' . mysql_error());
      }
  
      header("Content-type: application/json");
      $i = 0;
      while($row = mysql_fetch_array($result)) {
        $xxx[$i++] = array(
          "latitude" => $row['latitude'],
          "longitude"=> $row['longitude'],
          "msisdn"   => $row['msisdn'],
          "email"    => $row['email'],
          "created"  => $row['created']
        );
      }
      echo json_encode($xxx);
      break; 
    case 'h': // get history of the user
      $uuid=$_POST["ud"];
      
      $sql="select uuid, latitude, longitude, created from position_history where uuid='$uuid'";
      $result = mysql_query($sql);
      if (!$result) {
        die('Error at position select: ' . mysql_error());
      }
  
      header("Content-type: application/json");
      $i = 0;
      while($row = mysql_fetch_array($result)) {
        $xxx[$i++] = array(
          "id"       => $row['id'],
          "uuid"     => $row['uuid'],
          "latitude" => $row['latitude'],
          "longitude"=> $row['longitude'],
          "created"  => $row['created']);
      }
      echo json_encode($xxx);
      break;
    case 'p': // checkin in, publish current position
      $uuid     = $_POST["ud"];
      $latitude = $_POST["latitude"];
      $longitude= $_POST["longitude"];
      $currentDate=$_POST["date"];
      
      $sql="select * from current_position where uuid='$uuid'";
      $result = mysql_query($sql);
      if (!$result) {
        die('Error at position select: ' . mysql_error());
      }
      $row = mysql_fetch_object($result);

      if (!empty($row)){
        //echo "before ".$row->id.$row->uuid.$row->latitude.$row->longitude.$row->created;

        $sql="update current_position set latitude='$latitude', longitude='$longitude', created='$currentDate' where uuid='$uuid'";
        $result = mysql_query($sql);
        if (!$result) {
          die('Error at position update: ' . mysql_error());
        }

        $sql="INSERT INTO position_history (position_id, uuid, latitude, longitude, created) VALUES ('$row->id','$row->uuid','$row->latitude', '$row->longitude', '$row->created')";
        $result = mysql_query($sql);
        if (!$result) {
          die('Error at position history insert: ' . mysql_error());
        }
      } else {
        $sql="INSERT INTO current_position (latitude, longitude, uuid) VALUES ('$latitude','$longitude','$uuid')";
        $result = mysql_query($sql);
        if (!$result) {
          die('Error at position insert: ' . mysql_error());
        }
      }
      echo $result;
      break;   
    default: 
      echo "Invalid parameters!!";
  }  
  mysql_close($con);
} else {
  echo "Not enough parameters!!";
}

?>