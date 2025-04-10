import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ScreeningResultView.css'; // Create this CSS file

function ScreeningResultView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { screenings } = location.state || {};

  if (!screenings || !Array.isArray(screenings) || screenings.length === 0) {
    return (
      <div className="screening-view-container">
        No screening data available.
        <button className="back-button" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  const lastScreening = screenings[screenings.length - 1];
  let assessmentString = lastScreening ? lastScreening.assessment : null;
  let assessmentData = null;

  if (assessmentString) {
    assessmentString = assessmentString.replace(/^```json\n/, '').replace(/```$/, '').trim();
    try {
      assessmentData = JSON.parse(assessmentString);
    } catch (error) {
      console.error("Error parsing assessment JSON:", error);
      return (
        <div className="screening-view-container">
          Error parsing assessment data.
          <button className="back-button" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      );
    }
  }

  const formatKey = (key) => {
    return key.replace(/([A-Z])/g, ' $1').trim().replace(/=$/, '');
  };

  const renderValue = (value, level = 0) => {
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return (
          <ul style={{ marginLeft: `${level * 15}px` }}>
            {value.map((item, index) => (
              <li key={index}>{renderValue(item, level + 1)}</li>
            ))}
          </ul>
        );
      } else {
        return (
          <ul style={{ marginLeft: `${level * 15}px` }}>
            {Object.entries(value).map(([detailKey, detailValue]) => (
              <li key={detailKey}>
                <strong className="detail-key">{formatKey(detailKey)}:</strong>
                <span className="detail-value">{renderValue(detailValue, level + 1)}</span>
              </li>
            ))}
          </ul>
        );
      }
    }
    return value === null ? 'N/A' : value.toString();
  };

  
  return (
    <div className="screening-view-container">
      <h1>Latest Screening Details</h1>
      {assessmentData && typeof assessmentData === 'object' && assessmentData !== null ? (
        <div className="screening-item">
          <h2>Assessment</h2>
          {Object.entries(assessmentData).map(([key, value]) => (
            <div key={key} className="assessment-item">
              <strong className="assessment-key">{formatKey(key)}:</strong>
              <span className="assessment-value">{renderValue(value)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="screening-item">
          <h2>Assessment</h2>
          <p>No valid assessment data available for the latest screening.</p>
        </div>
      )}
      <button className="back-button" onClick={() => navigate(-1)}>
        Go Back
      </button>
    </div>
  );
}

export default ScreeningResultView;


/*
function ScreeningResultView() {
  const location = useLocation();
  const { screenings } = location.state || {};

  if (!screenings) {
    return <div className="screening-view-container">Error: No screening data passed.</div>;
  }

  const formatKey = (key) => {
    return key.replace(/([A-Z])/g, ' $1').trim().replace(/=$/, '');
  };

  if (!screenings || !Array.isArray(screenings) || screenings.length === 0) {
    return <div className="screening-view-container">No screening data available.</div>;
  }

  return (
    <div className="screening-view-container">
      <h1>Screening Details</h1>
      {screenings.map((screening, index) => (
        <div key={index} className="screening-item">
          <h2>Screening #{index + 1}</h2>
          {screening.assessment && typeof screening.assessment === 'object' && screening.assessment !== null ? (
            Object.entries(screening.assessment).map(([key, value]) => (
              <div key={key} className="assessment-item">
                <strong className="assessment-key">{formatKey(key)}:</strong>
                <span className="assessment-value">
                  {typeof value === 'object' && value !== null ? (
                    <ul>
                      {Object.entries(value).map(([detailKey, detailValue]) => (
                        <li key={detailKey}>
                          <strong className="detail-key">{formatKey(detailKey)}:</strong>
                          <span className="detail-value">{detailValue}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    value
                  )}
                </span>
              </div>
            ))
          ) : (
            <p>No detailed assessment data available for this screening.</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default ScreeningResultView;
*/