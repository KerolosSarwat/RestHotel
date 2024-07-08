function displayReservations(reservations) {
    const tableBody = document.getElementById('reservations-table');
    tableBody.innerHTML = ''; // Clear existing rows
  
    reservations.forEach(reservation => {
      const tableRow = document.createElement('tr');
      const nameCell = document.createElement('td');
      const detailsCell = document.createElement('td');
      const viewButtonCell = document.createElement('td');
  
      nameCell.textContent = reservation.name;
      detailsCell.textContent = reservation.details;
  
      const viewButton = document.createElement('button');
      viewButton.textContent = "View Details";
      viewButton.classList.add("btn", "btn-sm", "btn-info");
      viewButton.dataset.reservationDetails = JSON.stringify(reservation); // Store reservation data as JSON in a data attribute
      viewButton.addEventListener("click", function() {
        const reservationData = JSON.parse(this.dataset.reservationDetails);
        displayReservationDetails(reservationData);
      });
  
      viewButtonCell.appendChild(viewButton);
      tableRow.appendChild(nameCell);
      tableRow.appendChild(detailsCell);
      tableRow.appendChild(viewButtonCell);
  
      tableBody.appendChild(tableRow);
    });
  }
  
  function displayReservationDetails(reservation) {
    const modalBody = document.getElementById('reservation-details');
    modalBody.innerHTML = `
      <p><b>Name:</b> ${reservation.name}</p>
      <p><b>Details:</b> ${reservation.details}</p>
      `;
    const modal = new bootstrap.Modal(document.getElementById('reservationDetailsModal'));
    modal.show();
  }
  
  // Initial page load - Display all reservations
  displayReservations(getReservations());
  